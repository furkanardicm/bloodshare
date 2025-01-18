import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic'

interface Donor {
  userId: string;
  email: string;
  name: string;
  status: 'pending' | 'completed' | 'cancelled';
  addedAt: Date;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email || !session?.user?.name) {
      return NextResponse.json(
        { error: 'Oturum bilgileri eksik' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    const bloodRequest = await db.collection('bloodRequests').findOne({
      _id: new ObjectId(params.id)
    });

    if (!bloodRequest) {
      return NextResponse.json(
        { error: 'Bağış isteği bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı zaten bağışçı olarak eklenmiş mi kontrol et
    const existingDonor = bloodRequest.donors?.find(
      (d: Donor) => d.userId === session.user.id
    );

    if (existingDonor) {
      return NextResponse.json(
        { error: 'Bu bağış isteğine zaten bağışçı olarak eklendiniz' },
        { status: 400 }
      );
    }

    // İhtiyaç duyulan ünite sayısı kadar bağışçı var mı kontrol et
    if (bloodRequest.donors?.length >= bloodRequest.units) {
      return NextResponse.json(
        { error: 'Bu bağış isteği için yeterli sayıda bağışçı bulundu' },
        { status: 400 }
      );
    }

    // Yeni bağışçıyı ekle
    const newDonor: Donor = {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      status: 'pending',
      addedAt: new Date()
    };

    const donors = bloodRequest.donors || [];
    donors.push(newDonor);

    // Yeterli bağışçı sayısına ulaşıldıysa durumu güncelle
    const status = donors.length >= bloodRequest.units ? 'in_progress' : 'active';

    const updatedRequest = await db.collection('bloodRequests').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          donors,
          status
        }
      },
      { returnDocument: 'after' }
    );

    if (!updatedRequest?.value) {
      return NextResponse.json(
        { error: 'Bağış isteği güncellenirken bir hata oluştu' },
        { status: 500 }
      );
    }

    // Kullanıcının istatistiklerini güncelle
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { $inc: { pendingDonations: 1 } }
    );

    return NextResponse.json(updatedRequest?.value);
  } catch (error) {
    console.error('Bağışçı eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Bağışçı eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();

    const bloodRequest = await db.collection('bloodRequests').findOne(
      { _id: new ObjectId(params.id) },
      { projection: { donors: 1 } }
    );

    if (!bloodRequest) {
      return NextResponse.json(
        { error: 'Bağış isteği bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(bloodRequest.donors || []);
  } catch (error) {
    console.error('Bağışçıları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Bağışçılar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 