import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    phone?: string;
    city?: string;
    bloodType?: string;
    lastDonationDate?: Date;
    totalDonations?: number;
    helpedPeople?: number;
  }

  interface Session {
    user: User & {
      phone?: string;
      city?: string;
      bloodType?: string;
      lastDonationDate?: Date;
      totalDonations?: number;
      helpedPeople?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    phone?: string;
    city?: string;
    bloodType?: string;
    lastDonationDate?: Date;
    totalDonations?: number;
    helpedPeople?: number;
  }
} 