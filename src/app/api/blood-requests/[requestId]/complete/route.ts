import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

interface Donor {
  userId: string;
  status: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "İstek ID'si gerekli" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // İsteğin mevcut olup olmadığını ve kullanıcıya ait olduğunu kontrol et
    const bloodRequest = await db.collection("bloodRequests").findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!bloodRequest) {
      return NextResponse.json(
        { error: "İstek bulunamadı" },
        { status: 404 }
      );
    }

    // İsteği tamamlandı olarak işaretle
    const updatedRequest = await db.collection("bloodRequests").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: "completed",
          completedAt: new Date(),
          "donors.$[].status": "completed" // Tüm bağışçıları tamamlandı olarak işaretle
        }
      },
      { returnDocument: "after" }
    );

    // Bağışçıların completedDonations sayısını artır ve pendingDonations sayısını azalt
    if (bloodRequest.donors && bloodRequest.donors.length > 0) {
      const donorIds = bloodRequest.donors.map((donor: Donor) => new ObjectId(donor.userId));
      await db.collection("users").updateMany(
        { _id: { $in: donorIds } },
        {
          $inc: {
            completedDonations: 1,
            pendingDonations: -1
          }
        }
      );
    }

    // Güncellenmiş isteği tekrar çek
    const finalRequest = await db.collection("bloodRequests").findOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(finalRequest);
  } catch (error) {
    console.error("İstek tamamlama hatası:", error);
    return NextResponse.json(
      { error: "İstek tamamlanırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 