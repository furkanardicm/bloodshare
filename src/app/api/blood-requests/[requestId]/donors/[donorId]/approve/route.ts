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
    console.log('Session:', session);

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

    console.log('Bulunan istek:', bloodRequest);
    console.log('Aranan donorId:', params.donorId);
    console.log('Mevcut bağışçılar:', bloodRequest?.donors);

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

    console.log('Bulunan bağışçı indeksi:', donorIndex);

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
      { $set: { [updatePath]: 'approved' } },
      { returnDocument: 'after' }
    );

    console.log('Güncellenen istek:', updatedRequest);

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'İstek güncellenirken bir hata oluştu' },
        { status: 500 }
      );
    }

    // Bağışçının istatistiklerini güncelle
    const donorUser = await db.collection('users').findOne(
      { _id: new ObjectId(params.donorId) }
    );

    console.log('Bulunan bağışçı kullanıcısı:', donorUser);

    if (donorUser) {
      // Mevcut değerleri sayısal olarak al, yoksa 0 kullan
      const completedDonations = Number(donorUser.completedDonations || 0);
      const pendingDonations = Number(donorUser.pendingDonations || 0);
      const totalDonations = Number(donorUser.totalDonations || 0);

      console.log('Mevcut değerler:', {
        completedDonations,
        pendingDonations,
        totalDonations
      });

      // Bağışçının istatistiklerini güncelle
      const updateResult = await db.collection('users').findOneAndUpdate(
        { _id: donorUser._id },
        {
          $set: {
            completedDonations: completedDonations + 1,
            pendingDonations: Math.max(0, pendingDonations - 1),
            totalDonations: totalDonations + 1,
            lastDonationDate: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      console.log('Güncelleme sonrası kullanıcı:', updateResult);
    }

    // Bağışçı bilgilerini getir
    const donors = await Promise.all(
      updatedRequest.donors.map(async (donor: any) => {
        let userId = donor.userId;
        // Eğer userId string ise ObjectId'ye çevir
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

    console.log('Bağışçı bilgileri:', donors);

    // İsteği güncelle
    const request = {
      ...updatedRequest,
      donors
    };

    return NextResponse.json(request);
  } catch (error) {
    console.error('Bağışçı onaylama hatası:', error);
    return NextResponse.json(
      { error: 'Bağışçı onaylanırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 