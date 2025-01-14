import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { bloodType, hospital, city, units, description, contact } = await req.json();

    // Validasyon kontrolleri
    if (!bloodType || !hospital || !city || !units || !description || !contact) {
      return NextResponse.json(
        { error: "Tüm alanları doldurun" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const request = {
      bloodType,
      hospital,
      city,
      units: parseInt(units),
      description,
      contact,
      requesterEmail: session.user.email,
      status: "active",
      donors: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("bloodRequests").insertOne(request);

    if (!result.insertedId) {
      throw new Error("İstek oluşturulamadı");
    }

    return NextResponse.json(
      { message: "İstek başarıyla oluşturuldu", id: result.insertedId },
      { status: 201 }
    );

  } catch (error) {
    console.error("Kan bağışı isteği oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Kan bağışı isteği oluşturulamadı" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";
    
    const { db } = await connectToDatabase();

    const requests = await db.collection("bloodRequests")
      .aggregate([
        { $match: { status } },
        {
          $lookup: {
            from: "users",
            localField: "requesterEmail",
            foreignField: "email",
            as: "requester"
          }
        },
        {
          $addFields: {
            requesterName: { $arrayElemAt: ["$requester.name", 0] }
          }
        },
        {
          $project: {
            requester: 0,
            _id: 1,
            bloodType: 1,
            hospital: 1,
            city: 1,
            units: 1,
            description: 1,
            contact: 1,
            status: 1,
            donors: 1,
            createdAt: 1,
            updatedAt: 1,
            requesterEmail: 1,
            requesterName: 1
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    return NextResponse.json(requests);
  } catch (error) {
    console.error("İstekleri getirme hatası:", error);
    return NextResponse.json(
      { error: "İstekler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 