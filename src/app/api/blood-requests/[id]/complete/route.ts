import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    const bloodRequests = db.collection('bloodRequests')

    // İsteği bul
    const bloodRequest = await bloodRequests.findOne({
      _id: new ObjectId(params.id),
      requesterEmail: session.user.email
    })

    if (!bloodRequest) {
      return new NextResponse('Kan ihtiyacı bulunamadı veya bu işlem için yetkiniz yok', { status: 404 })
    }

    // İsteği tamamlandı olarak işaretle
    const result = await bloodRequests.updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status: 'completed',
          completedAt: new Date()
        } 
      }
    )

    if (result.modifiedCount === 0) {
      return new NextResponse('Güncelleme yapılamadı', { status: 400 })
    }

    const updatedRequest = await bloodRequests.findOne({ _id: new ObjectId(params.id) })
    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Kan ihtiyacı tamamlanırken hata:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 