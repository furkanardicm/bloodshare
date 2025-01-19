import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const bloodType = searchParams.get('bloodType');

    const { db } = await connectToDatabase();
    
    // Temel sorgu
    const query: any = { isDonor: true };

    // Şehir filtresi ekle
    if (city && city !== 'all') {
      query.city = city;
    }

    // Kan grubu filtresi ekle
    if (bloodType && bloodType !== 'all') {
      query.bloodType = bloodType;
    }
    
    const donors = await db.collection('users')
      .find(query)
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