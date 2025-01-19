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
    const bloodRequest = await db.collection('bloodRequests').findOne({
      _id: new ObjectId(params.requestId)
    });

    if (!bloodRequest) {
      return NextResponse.json(
        { error: 'İstek bulunamadı' },
        { status: 404 }
      );
    }

    // Bağışçıyı bul
    const donorIndex = bloodRequest.donors.findIndex(
      (donor: any) => donor.userId.toString() === params.donorId.toString()
    );

    if (donorIndex === -1) {
      return NextResponse.json(
        { error: 'Bağışçı bulunamadı' },
        { status: 404 }
      );
    }

    // Bağışçının durumunu güncelle
    const updatePath = `donors.${donorIndex}.status`;
    const updatedRequest = await db.collection('bloodRequests').findOneAndUpdate(
      { _id: new ObjectId(params.requestId) },
      { $set: { [updatePath]: 'rejected' } },
      { returnDocument: 'after' }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'İstek güncellenirken bir hata oluştu' },
        { status: 500 }
      );
    }

    // Bağışçının pendingDonations sayısını azalt
    await db.collection('users').updateOne(
      { _id: new ObjectId(params.donorId) },
      { $inc: { pendingDonations: -1 } }
    );

    // Bağışçı bilgilerini getir
    const donors = await Promise.all(
      updatedRequest.donors.map(async (donor: any) => {
        let userId = donor.userId;
        if (typeof userId === 'string') {
          userId = new ObjectId(userId);
        }
        
        const user = await db.collection('users').findOne(
          { _id: userId },
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
    console.error('Bağışçı reddetme hatası:', error);
    return NextResponse.json(
      { error: 'Bağışçı reddedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 