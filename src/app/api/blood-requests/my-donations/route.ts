import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/db'
import BloodRequest from '@/models/BloodRequest'
import { authOptions } from '@/lib/auth'

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
    const query: any = {
      'donors.userId': session.user.id,
    }

    // Eğer status parametresi varsa, query'e ekle
    if (status) {
      query.status = status
    }

    const donations = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name')

    return NextResponse.json(donations)
  } catch (error) {
    console.error('Bağışlar getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Bağışlar getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 