import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    console.log('MongoDB bağlantısı başarılı');

    const requests = await db.collection("bloodRequests")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Bulunan istekler:', requests);

    return NextResponse.json(requests);
  } catch (error) {
    console.error("İstekleri getirme hatası:", error);
    return NextResponse.json(
      { error: "İstekler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 