import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connect();

    const donors = await User.find({ isDonor: true })
      .select('name bloodType city lastDonationDate')
      .sort({ lastDonationDate: -1 })
      .lean();

    return NextResponse.json(donors);
  } catch (error) {
    console.error('Bağışçılar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bağışçılar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 