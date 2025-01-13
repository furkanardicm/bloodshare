import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connect } from "@/lib/mongodb"
import BloodRequest from "@/models/BloodRequest"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      )
    }

    await connect()
    const requests = await BloodRequest.find({ userId: session.user.id })
      .sort({ createdAt: -1 })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Kan bağışı istekleri yüklenirken hata:", error)
    return NextResponse.json(
      { error: "İstekler yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 