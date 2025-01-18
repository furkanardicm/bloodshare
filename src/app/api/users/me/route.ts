import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { WithId, Document, ObjectId } from "mongodb";

interface Donor {
  userId: ObjectId | string;
  status?: string;
}

interface BloodRequest extends WithId<Document> {
  donors: Donor[];
  createdAt: string;
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { db } = await connectToDatabase();
    console.log('MongoDB bağlantısı başarılı');
    
    // Kullanıcıyı bul
    const user = await db.collection("users").findOne(
      { email: session.user.email }
    );

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    console.log('Kullanıcı bulundu:', user);

    // Kullanıcının bağışlarını bul
    const bloodRequests = await db.collection("bloodRequests").find({
      'donors.userId': user._id
    }).toArray() as BloodRequest[];

    console.log('Kullanıcının bağışları:', bloodRequests);

    // Bağış sayılarını hesapla
    let totalDonations = 0;
    let pendingDonations = 0;
    let completedDonations = 0;
    let lastDonationDate: string | null = null;

    bloodRequests.forEach(request => {
      const userDonation = request.donors.find(d => {
        const donorId = typeof d.userId === 'string' ? d.userId : d.userId.toString();
        const userId = typeof user._id === 'string' ? user._id : user._id.toString();
        return donorId === userId;
      });

      if (userDonation) {
        if (userDonation.status === 'completed') {
          completedDonations++;
          // Son bağış tarihini güncelle
          if (!lastDonationDate || new Date(request.createdAt) > new Date(lastDonationDate)) {
            lastDonationDate = request.createdAt;
          }
        } else if (userDonation.status === 'pending') {
          pendingDonations++;
        }
      }
    });

    totalDonations = completedDonations;

    console.log('Hesaplanan bağış sayıları:', { totalDonations, pendingDonations, completedDonations, lastDonationDate });

    // Kullanıcı bilgilerini güncelle
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          totalDonations,
          pendingDonations,
          completedDonations,
          lastDonationDate
        }
      }
    );

    // Güncel kullanıcı bilgilerini döndür
    const updatedUser = {
      ...user,
      totalDonations,
      pendingDonations,
      completedDonations,
      lastDonationDate,
      _id: undefined
    };

    console.log('Güncellenmiş kullanıcı:', updatedUser);

    return NextResponse.json(updatedUser);
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