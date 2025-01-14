import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const data = await req.json();

    const { db } = await connectToDatabase();

    // Yeni kan isteği
    const newRequest = {
      userId: session.user.id,
      bloodType: data.bloodType,
      hospital: data.hospital,
      city: data.city,
      units: data.units,
      description: data.description,
      contact: data.contact,
      status: "active",
      donors: [],
      totalDonors: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection("bloodRequests").insertOne(newRequest);

    if (!result.insertedId) {
      throw new Error("Kan isteği oluşturulamadı");
    }

    return NextResponse.json(
      { message: "Kan isteği başarıyla oluşturuldu" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Kan isteği oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Kan isteği oluşturulurken bir hata oluştu" },
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
            localField: "userId",
            foreignField: "_id",
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
            userId: 1,
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