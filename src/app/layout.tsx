import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Providers from '@/components/providers/Providers';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Toaster as SonnerToaster } from 'sonner';

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
      <body className={`${poppins.className} antialiased dark:bg-[rgb(22,22,22)]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="min-h-screen bg-white dark:bg-[rgb(22,22,22)] transition-colors duration-300">
              <Header />
              <main className="dark:bg-[rgb(22,22,22)]">{children}</main>
              <Toaster />
              <SonnerToaster />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
