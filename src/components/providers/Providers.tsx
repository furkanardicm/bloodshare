'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem={false} disableTransitionOnChange={false}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 