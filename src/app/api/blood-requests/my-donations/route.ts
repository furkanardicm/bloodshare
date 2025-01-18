import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import BloodRequest from '@/models/BloodRequest'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Kullanıcının bağışçı olduğu ilanları bul
    const donations = await BloodRequest.find({
      'donors.userId': session.user.id
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .lean()

    return NextResponse.json(donations)
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Bağışlar yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 