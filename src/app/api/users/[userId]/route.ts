import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { ObjectId } from "mongodb";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();

    const user = await User.findById(new ObjectId(params.userId))
      .select('name email image bloodType city lastDonationDate donationCount')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Kullanıcı bilgileri getirme hatası:", error);
    return NextResponse.json(
      { error: "Kullanıcı bilgileri yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 