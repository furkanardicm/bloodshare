import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    // Kullanıcının tüm mesajlarını getir ve populate et
    const messages = await Message.find({
      $or: [
        { sender: session.user.id },
        { receiver: session.user.id }
      ],
      deletedFor: { $ne: session.user.id }
    })
    .populate('sender', 'name image')
    .populate('receiver', 'name image')
    .sort({ createdAt: 1 });

    // Mesajları client formatına dönüştür
    const formattedMessages = messages.map(msg => ({
      _id: msg._id.toString(),
      content: msg.content,
      sender: {
        _id: msg.sender._id.toString(),
        name: msg.sender.name,
        image: msg.sender.image
      },
      receiver: {
        _id: msg.receiver._id.toString(),
        name: msg.receiver.name,
        image: msg.receiver.image
      },
      readStatus: msg.readStatus,
      isEdited: msg.isEdited,
      createdAt: msg.createdAt,
      deletedFor: msg.deletedFor
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

    await dbConnect();

    const { content, receiverId } = await request.json();
    console.log('Gelen mesaj verisi:', { content, receiverId, senderId: session.user.id });

    // Alıcı kullanıcıyı bul
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.error('Alıcı bulunamadı:', receiverId);
      return new NextResponse('Alıcı bulunamadı', { status: 404 });
    }

    // Gönderen kullanıcıyı bul
    const sender = await User.findById(session.user.id);
    if (!sender) {
      console.error('Gönderen bulunamadı:', session.user.id);
      return new NextResponse('Gönderen bulunamadı', { status: 404 });
    }

    // Yeni mesaj oluştur
    const message = await Message.create({
      content,
      sender: sender._id,
      receiver: receiver._id,
      readStatus: 'UNREAD',
      isEdited: false,
      deletedFor: []
    });

    console.log('Oluşturulan mesaj:', message);

    // Mesajı populate et ve formatla
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name image')
      .populate('receiver', 'name image');

    const formattedMessage = {
      _id: populatedMessage._id.toString(),
      content: populatedMessage.content,
      sender: {
        _id: populatedMessage.sender._id.toString(),
        name: populatedMessage.sender.name,
        image: populatedMessage.sender.image
      },
      receiver: {
        _id: populatedMessage.receiver._id.toString(),
        name: populatedMessage.receiver.name,
        image: populatedMessage.receiver.image
      },
      readStatus: populatedMessage.readStatus,
      isEdited: populatedMessage.isEdited,
      createdAt: populatedMessage.createdAt,
      deletedFor: populatedMessage.deletedFor
    };

    console.log('Formatlanmış mesaj:', formattedMessage);
    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 