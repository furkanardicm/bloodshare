import { connect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    await connect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Girdiğiniz şifre hatalı' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 