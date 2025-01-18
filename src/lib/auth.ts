import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Lütfen tüm alanları doldurun');
        }

        await dbConnect();

        // Kullanıcıyı bul
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (!user) {
          throw new Error('Kullanıcı bulunamadı');
        }

        // Şifreyi kontrol et
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Hatalı şifre');
        }

        // Hassas bilgileri çıkar
        const userWithoutPassword = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          bloodType: user.bloodType,
          city: user.city
        };

        return userWithoutPassword;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.bloodType = user.bloodType;
        token.city = user.city;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.bloodType = token.bloodType as string;
        session.user.city = token.city as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/giris',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 