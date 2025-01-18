import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

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
          city: 1,
          isDonor: 1,
          totalDonations: 1,
          pendingDonations: 1,
          completedDonations: 1,
          lastDonationDate: 1,
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

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { name, phone, bloodType, city, isDonor } = data;

    if (!name || !phone || !bloodType || !city) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { 
        $set: {
          name,
          phone,
          bloodType,
          city,
          isDonor: Boolean(isDonor)
        }
      }
    );

    if (!result.matchedCount) {
      return new NextResponse("User not found", { status: 404 });
    }

    const updatedUser = await db.collection("users").findOne(
      { email: session.user.email },
      { 
        projection: {
          name: 1,
          email: 1,
          phone: 1,
          bloodType: 1,
          city: 1,
          isDonor: 1,
          _id: 0
        }
      }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 