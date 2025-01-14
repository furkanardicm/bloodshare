import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // URL'den status parametresini al
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Query oluştur
    const query: any = {
      requesterEmail: session.user.email
    }

    // Eğer status parametresi varsa, query'e ekle
    if (status) {
      query.status = status
    }
    
    const requests = await db.collection('bloodRequests')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(requests)
  } catch (error) {
    console.error('İstekler getirilirken hata:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 