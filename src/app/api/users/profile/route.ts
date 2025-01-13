import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connect } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const data = await request.json();
    const { name, email, phone, bloodType, isDonor } = data;

    await connect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // E-posta değiştirilmek isteniyorsa, başka bir kullanıcı tarafından kullanılıp kullanılmadığını kontrol et
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor' }, { status: 400 });
      }
    }

    // Kullanıcı bilgilerini güncelle
    user.name = name;
    user.email = email;
    user.phone = phone;
    user.bloodType = bloodType;
    user.isDonor = isDonor;

    await user.save();

    // Hassas bilgileri çıkar
    const { password, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Profil güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 