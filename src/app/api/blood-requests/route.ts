import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connect } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { bloodType, hospital, city, units, description, contact } = await request.json();

    if (!bloodType || !hospital || !city || !units || !description || !contact) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    await connect();

    const bloodRequest = await BloodRequest.create({
      userId: session.user.id,
      bloodType,
      hospital,
      city,
      units,
      description,
      contact,
      status: 'active'
    });

    return NextResponse.json(bloodRequest);
  } catch (error) {
    console.error('Kan ihtiyacı oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Kan ihtiyacı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    await connect();

    const bloodRequests = await BloodRequest.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(bloodRequests);
  } catch (error) {
    console.error("Kan bağışı istekleri alınırken hata:", error);
    return NextResponse.json(
      { error: "Kan bağışı istekleri alınamadı" },
      { status: 500 }
    );
  }
} 