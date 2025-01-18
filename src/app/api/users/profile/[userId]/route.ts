import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

interface Donor {
  userId: string;
  status: string;
}

interface BloodRequest {
  _id: string;
  bloodType: string;
  isUrgent: boolean;
  completedAt?: string;
  createdAt: string;
  status: string;
  donors: Donor[];
}

interface Stats {
  totalDonations: number;
  completedDonations: number;
  pendingDonations: number;
  urgentDonations: number;
  lastDonationDate: string | null;
  recentDonations: Array<{
    _id: string;
    bloodType: string;
    createdAt: string;
    status: string;
  }>;
  mostDonatedBloodType: string | null;
}

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(params.userId) }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const totalRequests = await db.collection('bloodRequests').countDocuments({
      userId: user._id.toString()
    });

    const completedDonations = user.completedDonations || 0;
    const pendingDonations = user.pendingDonations || 0;

    const response = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || undefined,
      bloodType: user.bloodType || undefined,
      city: user.city || undefined,
      memberSince: user.createdAt,
      isDonor: user.isDonor || false,
      stats: {
        totalDonations: completedDonations + pendingDonations,
        completedDonations: completedDonations,
        pendingDonations: pendingDonations,
        totalRequests: totalRequests,
        lastDonationDate: user.lastDonationDate || null,
        recentDonations: user.recentDonations || [],
        mostDonatedBloodType: user.mostDonatedBloodType || null
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Kullanıcı profili yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 