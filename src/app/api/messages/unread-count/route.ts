import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    // Okunmamış mesaj sayısını bul
    const count = await Message.countDocuments({
      receiver: session.user.id,
      readStatus: { $in: ['UNREAD', 'SENDER_READ'] }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Okunmamış mesaj sayısı alınamadı:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 