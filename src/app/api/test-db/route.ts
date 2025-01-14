'use server';

import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import { User } from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();

    const users = await User.find().lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Veritabanı bağlantısı test edilirken hata:', error);
    return NextResponse.json(
      { error: 'Veritabanı bağlantısı test edilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 