import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbConnect } from '@/lib/mongodb';
import UserModel, { IUser, IUserWithoutPassword } from '@/models/User';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

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
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gerekli');
        }

        try {
          await dbConnect();
          const user = await UserModel.findOne({ email: credentials.email }).lean() as IUser;
          
          if (!user) {
            throw new Error('Bu email adresi ile kayıtlı kullanıcı bulunamadı');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            throw new Error('Girdiğiniz şifre hatalı');
          }

          const userId = user._id?.toString();
          if (!userId || !Types.ObjectId.isValid(userId)) {
            throw new Error('Geçersiz kullanıcı ID');
          }

          const userWithoutPassword: IUserWithoutPassword = {
            id: userId,
            name: user.name || undefined,
            email: user.email || undefined,
            bloodType: user.bloodType || undefined,
            city: user.city || undefined,
            phone: user.phone || undefined,
            isAvailable: user.isAvailable || undefined,
            lastDonationDate: user.lastDonationDate || undefined,
            totalDonations: user.totalDonations,
            helpedPeople: user.helpedPeople
          };

          return userWithoutPassword;
        } catch (error: any) {
          console.error('Giriş hatası:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/giris',
    error: '/giris'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.bloodType = user.bloodType;
        token.city = user.city;
        token.phone = user.phone;
        token.isAvailable = user.isAvailable;
        token.lastDonationDate = user.lastDonationDate;
        token.totalDonations = user.totalDonations;
        token.helpedPeople = user.helpedPeople;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name === null ? undefined : token.name;
        session.user.email = token.email === null ? undefined : token.email;
        session.user.bloodType = token.bloodType === null ? undefined : token.bloodType;
        session.user.city = token.city === null ? undefined : token.city;
        session.user.phone = token.phone === null ? undefined : token.phone;
        session.user.isAvailable = token.isAvailable === null ? undefined : token.isAvailable;
        session.user.lastDonationDate = token.lastDonationDate === null ? undefined : token.lastDonationDate;
        session.user.totalDonations = token.totalDonations || 0;
        session.user.helpedPeople = token.helpedPeople || 0;
      }
      return session;
    }
  }
}; 