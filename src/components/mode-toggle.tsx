'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      className="w-9 h-9 p-0 border-[rgb(28,28,28)]"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-gray-400" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
} 