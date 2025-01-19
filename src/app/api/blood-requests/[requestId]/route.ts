import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    console.log('Fetching request:', params.requestId);

    // İsteği bul
    const bloodRequest = await db.collection('bloodRequests').findOne({
      _id: new ObjectId(params.requestId)
    });

    console.log('Found request:', bloodRequest);

    if (!bloodRequest) {
      return NextResponse.json(
        { error: 'İstek bulunamadı' },
        { status: 404 }
      );
    }

    // Bağışçı bilgilerini getir
    const donors = await Promise.all(
      (bloodRequest.donors || []).map(async (donor: any) => {
        const user = await db.collection('users').findOne(
          { _id: new ObjectId(donor.userId) },
          { projection: { name: 1, bloodType: 1, city: 1, phone: 1 } }
        );
        return {
          ...donor,
          user
        };
      })
    );

    console.log('Found donors:', donors);

    // İsteği güncelle
    const request = {
      ...bloodRequest,
      donors
    };

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error fetching blood request:', error);
    return NextResponse.json(
      { error: 'İstek yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 