import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const requests = await db.collection("bloodRequests")
      .find({ status: "active" })
      .sort({ createdAt: -1 })
      .toArray();

    // Kullanıcı bilgilerini ayrı bir sorgu ile alalım
    const userIds = requests.map(request => {
      try {
        return new ObjectId(request.userId);
      } catch (e) {
        console.error("Geçersiz ObjectId:", request.userId);
        return null;
      }
    }).filter(id => id !== null);

    const users = await db.collection("users")
      .find({ _id: { $in: userIds } })
      .project({ name: 1 })
      .toArray();

    // Kullanıcı bilgilerini eşleştirelim
    const requestsWithUsers = requests.map(request => {
      const user = users.find(u => u._id.toString() === request.userId);
      return {
        ...request,
        requesterName: user?.name || 'İsimsiz'
      };
    });

    return NextResponse.json(requestsWithUsers);
  } catch (error) {
    console.error("İhtiyaçları getirme hatası:", error);
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