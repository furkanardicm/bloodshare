import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connect } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    await connect();

    const [activeRequests, completedRequests, totalDonations] = await Promise.all([
      BloodRequest.countDocuments({ userId: session.user.id, status: 'active' }),
      BloodRequest.countDocuments({ userId: session.user.id, status: 'completed' }),
      BloodRequest.countDocuments({ userId: session.user.id, isDonation: true })
    ]);

    return NextResponse.json({
      activeRequests,
      completedRequests,
      totalDonations
    });
  } catch (error) {
    console.error('İstatistikler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'İstatistikler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 