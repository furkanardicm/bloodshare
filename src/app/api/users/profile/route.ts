import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // MongoDB'ye bağlan
    await dbConnect();

    const { name, bloodType, city, lastDonationDate } = await request.json();

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          name,
          bloodType,
          city,
          lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    return NextResponse.json(
      { error: 'Profil bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 