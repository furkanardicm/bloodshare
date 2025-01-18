'use server';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    // MongoDB'ye bağlan
    await dbConnect();

    // Test kullanıcısını oluştur
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ success: false, error: 'Database connection failed' });
  }
} 