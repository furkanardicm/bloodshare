import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId, Document, WithId } from 'mongodb';

export const dynamic = 'force-dynamic'

interface Donor {
  userId: string | ObjectId;
  email: string;
  name: string;
  status: 'pending' | 'completed' | 'cancelled';
  addedAt: Date;
}

interface BloodRequest {
  _id: ObjectId;
  userId: string | ObjectId;
  units: number;
  status: string;
  donors: Donor[];
}

export async function POST(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.id || !session?.user?.email || !session?.user?.name) {
      return NextResponse.json(
        { error: 'Oturum bilgileri eksik' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    console.log('MongoDB bağlantısı başarılı');

    // Önce kullanıcıyı bul
    const user = await db.collection('users').findOne({ email: session.user.email });
    console.log('Kullanıcı bulundu:', user);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const bloodRequest = await db.collection<BloodRequest>('bloodRequests').findOne({
      _id: new ObjectId(params.requestId)
    });
    console.log('Bulunan kan isteği:', bloodRequest);

    if (!bloodRequest) {
      return NextResponse.json(
        { error: 'Bağış isteği bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı zaten bağışçı olarak eklenmiş mi kontrol et
    const existingDonor = bloodRequest.donors?.find(
      (d: Donor) => d.userId.toString() === user._id.toString()
    );
    console.log('Mevcut bağışçı:', existingDonor);

    if (existingDonor) {
      return NextResponse.json(
        { error: 'Bu bağış isteğine zaten bağışçı olarak eklendiniz' },
        { status: 400 }
      );
    }

    // İhtiyaç duyulan ünite sayısı kadar bağışçı var mı kontrol et
    const currentDonorCount = bloodRequest.donors?.length || 0;
    if (currentDonorCount >= bloodRequest.units) {
      return NextResponse.json(
        { error: 'Bu bağış isteği için yeterli sayıda bağışçı bulundu' },
        { status: 400 }
      );
    }

    // Yeni bağışçıyı ekle
    const newDonor: Donor = {
      userId: user._id,
      email: session.user.email,
      name: session.user.name,
      status: 'pending',
      addedAt: new Date()
    };
    console.log('Eklenecek yeni bağışçı:', newDonor);

    // Yeterli bağışçı sayısına ulaşıldıysa durumu güncelle
    const status = currentDonorCount + 1 >= bloodRequest.units ? 'in_progress' : 'active';
    console.log('Yeni durum:', status);

    const updatedRequest = await db.collection<BloodRequest>('bloodRequests').findOneAndUpdate(
      { _id: new ObjectId(params.requestId) },
      { 
        $push: { donors: newDonor },
        $set: { status }
      },
      { returnDocument: 'after' }
    ) as WithId<BloodRequest> | null;
    console.log('Güncellenen istek:', updatedRequest);

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Bağış isteği güncellenirken bir hata oluştu' },
        { status: 500 }
      );
    }

    // Kullanıcının mevcut pendingDonations değerini al
    const currentUser = await db.collection('users').findOne(
      { _id: user._id },
      { projection: { pendingDonations: 1 } }
    );
    console.log('Mevcut kullanıcı durumu:', currentUser);

    const currentPendingDonations = currentUser?.pendingDonations || 0;

    // Kullanıcının istatistiklerini güncelle
    const userUpdate = await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          pendingDonations: currentPendingDonations + 1,
          isDonor: true 
        }
      }
    );
    console.log('Kullanıcı güncelleme sonucu:', userUpdate);

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Bağışçı eklenirken detaylı hata:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Bağışçı eklenirken bir hata oluştu: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Bağışçı eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const { db } = await connectToDatabase();

    const bloodRequest = await db.collection('bloodRequests').findOne(
      { _id: new ObjectId(params.requestId) },
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