import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface Donor {
  userId: string | ObjectId;
  status?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    console.log('MongoDB bağlantısı başarılı')

    // Önce kullanıcıyı bul
    const user = await db.collection('users').findOne({ email: session.user.email })
    console.log('Kullanıcı bulundu:', user)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Kullanıcının bağışçı olduğu ilanları bul
    const donations = await db.collection('bloodRequests')
      .find({
        'donors.userId': user._id
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log('Bulunan bağışlar:', donations)

    // Her bağış için kullanıcının bağış durumunu kontrol et
    const processedDonations = donations.map(donation => {
      const userDonation = donation.donors.find((d: Donor) => {
        const donorId = d.userId instanceof ObjectId ? d.userId.toString() : d.userId;
        const userId = user._id instanceof ObjectId ? user._id.toString() : user._id;
        return donorId === userId;
      });
      return {
        ...donation,
        donationStatus: userDonation?.status || 'pending'
      }
    })

    console.log('İşlenmiş bağışlar:', processedDonations)

    return NextResponse.json(processedDonations)
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Bağışlar yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 