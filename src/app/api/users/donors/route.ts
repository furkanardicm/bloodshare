import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const donors = await db.collection('users')
      .find({ isDonor: true })
      .project({
        name: 1,
        bloodType: 1,
        city: 1,
        lastDonationDate: 1
      })
      .sort({ lastDonationDate: -1 })
      .toArray();

    return NextResponse.json(donors);
  } catch (error) {
    console.error('Bağışçılar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bağışçılar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 