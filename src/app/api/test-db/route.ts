'use server';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Tüm kullanıcıları getir
    const users = await UserModel.find({}).select('-password');
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error('Veritabanı hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 