import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Chat from '@/models/Chat';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const chats = await Chat.find({
      participants: session.user.id
    })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name image')
    .populate({
      path: 'lastMessage',
      select: 'content createdAt sender'
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 