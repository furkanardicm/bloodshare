import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { 
        projection: {
          name: 1,
          email: 1,
          phone: 1,
          bloodType: 1,
          _id: 0
        }
      }
    );

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 