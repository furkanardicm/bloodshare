'use server';

import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, bloodType, city, isDonor = true } = await request.json();

    if (!name || !email || !password || !phone || !bloodType || !city) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      bloodType,
      city,
      isDonor: Boolean(isDonor),
    });

    return NextResponse.json(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodType: user.bloodType,
        city: user.city,
        isDonor: user.isDonor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 