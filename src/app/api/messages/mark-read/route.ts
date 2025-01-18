import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const { messageIds } = await request.json();
    console.log('Okunacak mesajlar:', messageIds);

    if (!messageIds || !Array.isArray(messageIds)) {
      return new NextResponse('Geçersiz mesaj ID listesi', { status: 400 });
    }

    // Mesajları güncelle
    const updateResult = await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiver: session.user.id,
        readStatus: 'UNREAD'
      },
      {
        $set: { readStatus: 'ALL_READ' }
      }
    );

    console.log('Güncelleme sonucu:', updateResult);

    return NextResponse.json({
      success: true,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Mesajlar okundu olarak işaretlenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 