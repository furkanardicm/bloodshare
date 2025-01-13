import { NextResponse } from "next/server";
import BloodRequest from "@/models/BloodRequest";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    await User.init();

    const bloodRequests = await BloodRequest.find({ status: "active" })
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .lean();

    return NextResponse.json(bloodRequests);
  } catch (error) {
    console.error("Kan bağışı istekleri alınırken hata:", error);
    return NextResponse.json(
      { error: "Kan bağışı istekleri alınamadı" },
      { status: 500 }
    );
  }
} 