import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Kullanıcının tamamlanmış bağışlarını ve isteklerini getir
    const [donations, requests] = await Promise.all([
      // Kullanıcının bağışçı olduğu tamamlanmış ilanlar
      db.collection('bloodRequests')
        .find({
          'donors.userId': session.user.id,
          status: 'completed'
        })
        .sort({ completedAt: -1, createdAt: -1 })
        .toArray(),

      // Kullanıcının kendi oluşturduğu tamamlanmış ilanlar
      db.collection('bloodRequests')
        .find({
          userId: session.user.id,
          status: 'completed'
        })
        .sort({ completedAt: -1, createdAt: -1 })
        .toArray()
    ]);

    // Tüm kayıtları birleştir ve tarihe göre sırala
    const history = [...donations, ...requests].sort((a, b) => 
      new Date(b.completedAt || b.createdAt).getTime() - 
      new Date(a.completedAt || a.createdAt).getTime()
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error('Geçmiş kayıtları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Geçmiş kayıtları yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 