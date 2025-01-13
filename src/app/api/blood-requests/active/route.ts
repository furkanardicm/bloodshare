import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb";
import BloodRequest from "@/models/BloodRequest";
import User from "@/models/User";

export async function GET() {
  try {
    await connect();
    await User.init();
    
    const requests = await BloodRequest.find({ status: "active" })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Kan ihtiyaçları yüklenirken hata:", error);
    return NextResponse.json(
      { error: "İhtiyaçlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 