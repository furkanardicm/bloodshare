import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connect();

    const requests = await BloodRequest.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name');

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Aktif kan ihtiyaçları getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Kan ihtiyaçları getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 