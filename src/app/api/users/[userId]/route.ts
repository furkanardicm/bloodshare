import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { ObjectId, WithId, Document } from "mongodb";
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
  donors: Donor[];
}

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { db } = await connectToDatabase();
    
    // Ana kullanıcı bilgilerini getir
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(params.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının tüm bağışlarını getir
    const rawDonations = await db.collection('bloodRequests')
      .find({
        'donors.userId': user._id.toString(),
      })
      .toArray();

    // MongoDB verilerini BloodRequest tipine dönüştür
    const donations: BloodRequest[] = rawDonations.map(d => ({
      _id: d._id.toString(),
      bloodType: d.bloodType as string,
      isUrgent: d.isUrgent as boolean,
      completedAt: d.completedAt as string | undefined,
      donors: (d.donors || []).map((donor: any) => ({
        userId: donor.userId as string,
        status: donor.status as string
      }))
    }));

    // İstatistikleri hesapla
    const stats = {
      totalDonations: donations.length,
      completedDonations: donations.filter(d => 
        d.donors.find((donor: Donor) => 
          donor.userId === user._id.toString() && 
          donor.status === 'completed'
        )
      ).length,
      pendingDonations: donations.filter(d => 
        d.donors.find((donor: Donor) => 
          donor.userId === user._id.toString() && 
          donor.status === 'pending'
        )
      ).length,
      urgentDonations: donations.filter(d => 
        d.isUrgent && 
        d.donors.find((donor: Donor) => 
          donor.userId === user._id.toString() && 
          donor.status === 'completed'
        )
      ).length,
      lastDonationDate: donations
        .filter(d => d.donors.find((donor: Donor) => 
          donor.userId === user._id.toString() && 
          donor.status === 'completed'
        ))
        .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0]?.completedAt || null,
      mostDonatedBloodTypes: donations
        .filter(d => d.donors.find((donor: Donor) => 
          donor.userId === user._id.toString() && 
          donor.status === 'completed'
        ))
        .reduce((acc, curr) => {
          acc[curr.bloodType] = (acc[curr.bloodType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    };

    // En çok bağış yapılan kan grubunu bul
    const bloodTypes = Object.entries(stats.mostDonatedBloodTypes);
    const mostDonatedBloodType = bloodTypes.length > 0 
      ? bloodTypes.reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : null;

    return NextResponse.json({
      ...user,
      stats: {
        ...stats,
        mostDonatedBloodType
      }
    });
  } catch (error) {
    console.error("Kullanıcı bilgileri getirme hatası:", error);
    return NextResponse.json(
      { error: "Kullanıcı bilgileri yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 