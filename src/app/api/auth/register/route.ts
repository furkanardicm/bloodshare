'use server';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('API - Ham request body:', body);

    const {
      name,
      email,
      password,
      bloodType,
      city,
      phone
    } = body;

    console.log('API - Ayrıştırılan veriler:', {
      name,
      email,
      bloodType,
      city,
      phone
    });

    // Zorunlu alan kontrolü
    if (!name || !email || !password || !bloodType || !city || !phone) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!bloodType) missingFields.push('bloodType');
      if (!city) missingFields.push('city');
      if (!phone) missingFields.push('phone');

      console.error('Eksik alanlar:', missingFields);
      return NextResponse.json(
        { error: 'Eksik alanlar var', fields: missingFields },
        { status: 400 }
      );
    }

    // MongoDB bağlantısı
    await dbConnect();

    // Email kontrolü
    const existingUser = await UserModel.findOne({ email }).exec();
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    try {
      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Yeni kullanıcı oluştur
      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        bloodType,
        city: city.trim(),
        phone: phone.trim(),
        isAvailable: true,
        lastDonationDate: null
      };
      
      console.log('API - Oluşturulacak kullanıcı verileri:', userData);
      
      const user = await UserModel.create(userData);
      console.log('API - Oluşturulan kullanıcı:', user.toObject());

      // Hassas bilgileri çıkar
      const { password: _, ...userWithoutPassword } = user.toObject();

      return NextResponse.json(
        { message: 'Kayıt başarılı', user: userWithoutPassword },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error('Veritabanı hatası:', dbError);
      
      // Validasyon hatası
      if (dbError.name === 'ValidationError') {
        const validationErrors = Object.values(dbError.errors).map((err: any) => err.message);
        return NextResponse.json(
          { error: 'Validasyon hatası', details: validationErrors },
          { status: 400 }
        );
      }

      // Duplicate key hatası
      if (dbError.code === 11000) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }

      throw dbError;
    }
  } catch (error: any) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 