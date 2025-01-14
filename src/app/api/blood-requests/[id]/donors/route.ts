import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

interface Donor {
  userId: string;
  email: string;
  name: string | null;
  status: string;
  addedAt: Date;
}

interface BloodRequest {
  _id: ObjectId;
  userId: string;
  donors: Donor[];
}

export async function POST(
  req: Request,
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

    const { db } = await connectToDatabase();
    const requestId = new ObjectId(params.id);

    // İsteği kontrol et
    const request = await db.collection<BloodRequest>("bloodRequests").findOne({
      _id: requestId
    });

    if (!request) {
      return NextResponse.json(
        { error: "İstek bulunamadı" },
        { status: 404 }
      );
    }

    // Kendi isteğine bağışçı olmayı engelle
    if (request.userId === session.user.id) {
      return NextResponse.json(
        { error: "Kendi isteğinize bağışçı olamazsınız" },
        { status: 400 }
      );
    }

    // Bağışçı zaten eklenmiş mi kontrol et
    const existingDonor = request.donors?.find(
      (donor) => donor.userId === session.user.id
    );

    if (existingDonor) {
      return NextResponse.json(
        { error: "Bu isteğe zaten bağışçı olarak eklendiniz" },
        { status: 400 }
      );
    }

    // Yeni bağışçı
    const newDonor: Donor = {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      status: 'pending',
      addedAt: new Date()
    };

    // Bağışçıyı ekle
    const result = await db.collection<BloodRequest>("bloodRequests").updateOne(
      { _id: requestId },
      { $push: { donors: newDonor } }
    );

    if (!result.modifiedCount) {
      throw new Error("Bağışçı eklenemedi");
    }

    // Kullanıcının isDonor alanını güncelle
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: { isDonor: true },
        $inc: { 
          pendingDonations: 1,
          totalDonations: 1
        }
      }
    );

    return NextResponse.json(
      { message: "Bağışçı olarak başarıyla eklendi" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Bağışçı ekleme hatası:", error);
    return NextResponse.json(
      { error: "Bağışçı eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const requestId = new ObjectId(params.id);

    const request = await db.collection<BloodRequest>("bloodRequests").findOne(
      { _id: requestId },
      { projection: { donors: 1 } }
    );

    if (!request) {
      return NextResponse.json(
        { error: "İstek bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(request.donors || []);
  } catch (error) {
    console.error("Bağışçıları getirme hatası:", error);
    return NextResponse.json(
      { error: "Bağışçılar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 