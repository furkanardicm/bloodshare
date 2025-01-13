import CredentialsProvider from 'next-auth/providers/credentials';
import { dbConnect } from '@/lib/mongodb';
import { User, type IUser, type IUserWithoutPassword } from "@/models/User";
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface User extends IUserWithoutPassword {}
  interface Session {
    user: IUserWithoutPassword;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends IUserWithoutPassword {}
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-posta', type: 'text' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-posta ve şifre gereklidir');
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error('Kullanıcı bulunamadı');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Şifre yanlış');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            bloodType: user.bloodType,
            isDonor: user.isDonor,
            lastDonationDate: user.lastDonationDate,
            city: user.city,
            totalDonations: user.totalDonations,
            helpedPeople: user.helpedPeople,
          } as IUserWithoutPassword;
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone;
        token.bloodType = user.bloodType;
        token.isDonor = user.isDonor;
        token.lastDonationDate = user.lastDonationDate;
        token.city = user.city;
        token.totalDonations = user.totalDonations;
        token.helpedPeople = user.helpedPeople;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          id: token.id ?? '',
          name: token.name ?? '',
          email: token.email ?? '',
          phone: token.phone ?? '',
          bloodType: token.bloodType ?? '',
          isDonor: token.isDonor ?? false,
          lastDonationDate: token.lastDonationDate,
          city: token.city ?? '',
          totalDonations: token.totalDonations ?? 0,
          helpedPeople: token.helpedPeople ?? 0,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 