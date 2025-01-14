import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/db'
import BloodRequest from '@/models/BloodRequest'
import { User } from '@/models/User'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    await dbConnect()

    const bloodRequest = await BloodRequest.findById(params.id)
    if (!bloodRequest) {
      return NextResponse.json(
        { error: 'Bağış isteği bulunamadı' },
        { status: 404 }
      )
    }

    // Bağışçıyı bul
    const donor = bloodRequest.donors.find(
      (d: any) => d.userId === session.user.id
    )

    if (!donor) {
      return NextResponse.json(
        { error: 'Bu bağış isteğinde bağışçı olarak kayıtlı değilsiniz' },
        { status: 403 }
      )
    }

    // Bağışçının durumunu güncelle
    donor.status = 'completed'

    // Tüm bağışçılar tamamlandıysa isteği de tamamla
    const allCompleted = bloodRequest.donors.every(
      (d: any) => d.status === 'completed'
    )
    if (allCompleted && bloodRequest.donors.length >= bloodRequest.units) {
      bloodRequest.status = 'completed'
      bloodRequest.completedAt = new Date()
    }

    await bloodRequest.save()

    // Kullanıcının istatistiklerini güncelle
    await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          isDonor: true,
          lastDonationDate: new Date()
        },
        $inc: { 
          totalDonations: 1,
          pendingDonations: -1,
          completedDonations: 1
        }
      },
      { new: true }
    )

    return NextResponse.json(bloodRequest)
  } catch (error) {
    console.error('Bağış tamamlanırken hata:', error)
    return NextResponse.json(
      { error: 'Bağış tamamlanırken bir hata oluştu' },
      { status: 500 }
    )
  }
} 