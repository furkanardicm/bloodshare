import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/db'
import BloodRequest from '@/models/BloodRequest'
import { User } from '@/models/User'
import { authOptions } from '@/lib/auth'

interface Donor {
  userId: string
  email: string
  status: string
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    await dbConnect()

    // URL'den status parametresini al
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Query oluştur
    let query: any = {
      donors: {
        $elemMatch: {
          userId: session.user.id
        }
      }
    }

    // Eğer status parametresi varsa, query'i güncelle
    if (status) {
      query = {
        donors: {
          $elemMatch: {
            userId: session.user.id,
            status: status
          }
        }
      }
    }

    const donations = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name')

    // Her bağış için kullanıcının durumunu kontrol et
    const processedDonations = donations.map(donation => {
      const userDonation = donation.donors.find((d: Donor) => d.userId === session.user.id)
      return {
        ...donation.toObject(),
        donorStatus: userDonation?.status || 'pending'
      }
    })

    // Kullanıcının bekleyen bağış sayısını güncelle
    const pendingCount = processedDonations.filter(d => d.donorStatus === 'pending').length
    await User.findByIdAndUpdate(
      session.user.id,
      { $set: { pendingDonations: pendingCount } },
      { new: true }
    )

    return NextResponse.json(processedDonations)
  } catch (error) {
    console.error('Bağışlar getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Bağışlar getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 