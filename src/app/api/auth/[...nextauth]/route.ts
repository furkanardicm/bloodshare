import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth({
  ...authOptions,
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/'
  }
});

export { handler as GET, handler as POST }; 