import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('API çağrısı başladı');
    const { db } = await connectToDatabase();
    console.log('MongoDB bağlantısı başarılı');

    // Tüm kan isteklerini getir (durum filtresi olmadan)
    const allRequests = await db.collection("bloodRequests").find({}).toArray();
    console.log('Tüm istekler:', allRequests);

    // Aktif ve bekleyen istekleri getir
    const requests = await db.collection("bloodRequests")
      .find({ 
        status: { $in: ["active", "pending"] }
      })
      .sort({ createdAt: -1 })
      .toArray();
    console.log('Filtrelenmiş istekler:', requests);

    if (requests.length === 0) {
      console.log('Hiç istek bulunamadı');
      return NextResponse.json([]);
    }

    // Kullanıcı bilgilerini ayrı bir sorgu ile alalım
    const userIds = requests.map(request => {
      try {
        return new ObjectId(request.userId);
      } catch (e) {
        console.error("Geçersiz ObjectId:", request.userId);
        return null;
      }
    }).filter(id => id !== null);
    console.log('Kullanıcı IDleri:', userIds);

    const users = await db.collection("users")
      .find({ _id: { $in: userIds } })
      .project({ name: 1 })
      .toArray();
    console.log('Bulunan kullanıcılar:', users);

    // Kullanıcı bilgilerini eşleştirelim
    const requestsWithUsers = requests.map(request => {
      const user = users.find(u => u._id.toString() === request.userId);
      return {
        ...request,
        requesterName: user?.name || 'İsimsiz'
      };
    });
    console.log('Son işlenmiş veri:', requestsWithUsers);

    return NextResponse.json(requestsWithUsers);
  } catch (error) {
    console.error("İhtiyaçları getirme detaylı hata:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `İhtiyaçlar yüklenirken bir hata oluştu: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "İhtiyaçlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 