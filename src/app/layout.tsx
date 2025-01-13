import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Providers from '@/components/providers/Providers';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} antialiased`}>
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
