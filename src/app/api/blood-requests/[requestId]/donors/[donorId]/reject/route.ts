import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { requestId: string; donorId: string } }
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

    // İsteği bul
    const bloodRequest = await db.collection('blood-requests').findOne({
      _id: new ObjectId(params.requestId),
      userId: session.user.id
    });

    if (!bloodRequest) {
      return NextResponse.json(
        { error: 'İstek bulunamadı' },
        { status: 404 }
      );
    }

    // Bağışçıyı bul ve durumunu güncelle
    const updatedRequest = await db.collection('blood-requests').findOneAndUpdate(
      {
        _id: new ObjectId(params.requestId),
        'donors.userId': params.donorId
      },
      {
        $set: {
          'donors.$.status': 'rejected'
        }
      },
      { returnDocument: 'after' }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Bağışçı bulunamadı' },
        { status: 404 }
      );
    }

    // Bağışçı bilgilerini getir
    const donors = await Promise.all(
      updatedRequest.donors.map(async (donor: any) => {
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

    // İsteği güncelle
    const request = {
      ...updatedRequest,
      donors
    };

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error rejecting donor:', error);
    return NextResponse.json(
      { error: 'Bağışçı reddedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 