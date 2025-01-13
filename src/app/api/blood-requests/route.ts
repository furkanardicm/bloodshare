import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import BloodRequest from "@/models/BloodRequest";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const body = await req.json();
    const { bloodType, hospital, city, units, description, contact } = body;

    await dbConnect();

    const bloodRequest = await BloodRequest.create({
      userId: session.user.id,
      bloodType,
      hospital,
      city,
      units,
      description,
      contact,
    });

    return NextResponse.json(bloodRequest);
  } catch (error) {
    console.error("Kan bağışı isteği oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Kan bağışı isteği oluşturulamadı" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    await dbConnect();

    const bloodRequests = await BloodRequest.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(bloodRequests);
  } catch (error) {
    console.error("Kan bağışı istekleri alınırken hata:", error);
    return NextResponse.json(
      { error: "Kan bağışı istekleri alınamadı" },
      { status: 500 }
    );
  }
} 