import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId, Document, UpdateFilter } from "mongodb";
import { authOptions } from "@/lib/auth";

interface Donor {
  email: string;
  name: string;
  status: string;
  createdAt: Date;
}

interface BloodRequest extends Document {
  _id: ObjectId;
  donors?: Donor[];
  status?: string;
  updatedAt?: Date;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.name) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    console.log('MongoDB bağlantısı başarılı');

    // Kan isteğini bul
    const bloodRequest = await db.collection<BloodRequest>("bloodRequests").findOne({
      _id: new ObjectId(params.id)
    });

    if (!bloodRequest) {
      return NextResponse.json(
        { error: "Kan isteği bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının zaten bağışçı olup olmadığını kontrol et
    const existingDonor = bloodRequest.donors?.find(
      (donor) => donor.email === session.user.email
    );

    if (existingDonor) {
      return NextResponse.json(
        { error: "Bu kan isteği için zaten bağışçı olarak kayıtlısınız" },
        { status: 400 }
      );
    }

    // Yeni bağışçıyı ekle
    const newDonor: Donor = {
      email: session.user.email,
      name: session.user.name,
      status: 'pending',
      createdAt: new Date()
    };

    // Kan isteğini güncelle
    const updateFilter: UpdateFilter<BloodRequest> = {
      $push: { donors: { $each: [newDonor] } } as any,
      $set: { 
        updatedAt: new Date(),
        ...(bloodRequest.donors && bloodRequest.donors.length >= 2 ? { status: 'completed' } : {})
      }
    };

    const result = await db.collection<BloodRequest>("bloodRequests").updateOne(
      { _id: new ObjectId(params.id) },
      updateFilter
    );

    if (!result.modifiedCount) {
      throw new Error('Bağışçı eklenirken bir hata oluştu');
    }

    // Kullanıcının istatistiklerini güncelle
    await db.collection("users").updateOne(
      { email: session.user.email },
      { 
        $inc: { 
          totalDonations: 1,
          pendingDonations: 1
        },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bağışçı ekleme hatası:", error);
    return NextResponse.json(
      { error: "Bağışçı eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 