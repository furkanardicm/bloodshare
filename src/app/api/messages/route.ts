import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Son 50 mesajı getir
    const messages = await db.collection('messages')
      .find({
        $or: [
          { sender: new ObjectId(session.user.id) },
          { receiver: new ObjectId(session.user.id) }
        ],
        deletedFor: { $ne: new ObjectId(session.user.id) }
      })
      .sort({ createdAt: -1 }) // Yeniden eskiye sırala
      .limit(50) // Son 50 mesaj
      .toArray();

    // Kullanıcı bilgilerini getir
    const userIds = Array.from(new Set([
      ...messages.map(m => m.sender.toString()),
      ...messages.map(m => m.receiver.toString())
    ]));

    const users = await db.collection('users')
      .find({ _id: { $in: userIds.map((id: string) => new ObjectId(id)) } })
      .project({ name: 1, image: 1 })
      .toArray();

    const usersMap = new Map(users.map(u => [u._id.toString(), u]));

    // Mesajları formatla
    const formattedMessages = messages.map(msg => ({
      _id: msg._id.toString(),
      content: msg.content,
      sender: {
        _id: msg.sender.toString(),
        name: usersMap.get(msg.sender.toString())?.name,
        image: usersMap.get(msg.sender.toString())?.image
      },
      receiver: {
        _id: msg.receiver.toString(),
        name: usersMap.get(msg.receiver.toString())?.name,
        image: usersMap.get(msg.receiver.toString())?.image
      },
      readStatus: msg.readStatus,
      isEdited: msg.isEdited,
      createdAt: msg.createdAt,
      deletedFor: msg.deletedFor?.map((id: ObjectId) => id.toString()) || []
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Mesajlar alınırken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { db } = await connectToDatabase();

    const { content, receiverId } = await request.json();
    console.log('Gelen mesaj verisi:', { content, receiverId, senderId: session.user.id });

    // Alıcı kullanıcıyı bul
    const receiver = await db.collection('users').findOne({ 
      _id: new ObjectId(receiverId) 
    });
    
    if (!receiver) {
      console.error('Alıcı bulunamadı:', receiverId);
      return new NextResponse('Alıcı bulunamadı', { status: 404 });
    }

    // Gönderen kullanıcıyı bul
    const sender = await db.collection('users').findOne({ 
      _id: new ObjectId(session.user.id) 
    });
    
    if (!sender) {
      console.error('Gönderen bulunamadı:', session.user.id);
      return new NextResponse('Gönderen bulunamadı', { status: 404 });
    }

    // Yeni mesaj oluştur
    const message = await db.collection('messages').insertOne({
      content,
      sender: new ObjectId(sender._id),
      receiver: new ObjectId(receiver._id),
      readStatus: 'UNREAD',
      isEdited: false,
      deletedFor: [],
      createdAt: new Date()
    });

    console.log('Oluşturulan mesaj:', message);

    // Mesajı formatla
    const formattedMessage = {
      _id: message.insertedId.toString(),
      content,
      sender: {
        _id: sender._id.toString(),
        name: sender.name,
        image: sender.image
      },
      receiver: {
        _id: receiver._id.toString(),
        name: receiver.name,
        image: receiver.image
      },
      readStatus: 'UNREAD',
      isEdited: false,
      createdAt: new Date(),
      deletedFor: []
    };

    return NextResponse.json(formattedMessage, { status: 201 });
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 