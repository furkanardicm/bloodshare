import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

export async function PATCH(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { messageId } = params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Mesaj içeriği gerekli' },
        { status: 400 }
      );
    }

    await dbConnect();

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 });
    }

    if (message.sender.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu mesajı düzenleme yetkiniz yok' },
        { status: 403 }
      );
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    await message.populate('sender', 'name image');
    await message.populate('receiver', 'name image');

    return NextResponse.json(message);
  } catch (error) {
    console.error('Mesaj düzenlenirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj düzenlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { messageId } = params;
    const { deleteForAll } = await req.json();

    await dbConnect();

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 });
    }

    if (message.sender.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu mesajı silme yetkiniz yok' },
        { status: 403 }
      );
    }

    if (deleteForAll) {
      await message.deleteOne();
    } else {
      message.deletedFor.push(session.user.id);
      await message.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mesaj silinirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 