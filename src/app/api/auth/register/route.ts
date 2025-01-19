'use server';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { name, email, password, phone, bloodType, city, isDonor = true } = await request.json();

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new NextResponse('Bu email adresi zaten kullanılıyor', { status: 400 });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      bloodType,
      city,
      isDonor: Boolean(isDonor),
      role: 'USER',
      emailVerified: null,
      image: null,
      completedDonations: 0,
      pendingDonations: 0,
      totalDonations: 0
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodType: user.bloodType,
        city: user.city,
        isDonor: user.isDonor
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Kayıt olurken hata:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Bir hata oluştu',
      { status: 500 }
    );
  }
} 