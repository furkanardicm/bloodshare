import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const requests = await db.collection('bloodRequests')
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(requests)
  } catch (error) {
    console.error('�htiyaçlar getirilirken hata:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 