import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Providers from '@/components/providers/Providers';
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kan Bağışı Platformu',
  description: 'Hayat kurtarmak için bir damla kan yeter!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            <Header />
            <main className="dark:bg-black">{children}</main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
