'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Droplet, ChevronDown, User, Users, Heart, LogIn, LogOut, UserPlus } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '../mode-toggle';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [currentLang, setCurrentLang] = useState('tr');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b bg-white dark:bg-[rgb(22,22,22)] dark:border-[rgb(28,28,28)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
            <Droplet className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">Lifeflow</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Give Blood, Save Lives</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/bagiscilar" 
              className={cn(
                "text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-600 transition-colors whitespace-nowrap flex items-center gap-2 relative group",
                pathname === "/bagiscilar" && "text-red-600 dark:text-red-600"
              )}
            >
              <Users className="w-4 h-4" />
              <span>Bağışçılar</span>
              <div className={cn(
                "absolute -bottom-[1.45rem] left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left",
                pathname === "/bagiscilar" && "scale-x-100"
              )} />
            </Link>
            <Link 
              href="/ihtiyaclar" 
              className={cn(
                "text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-600 transition-colors whitespace-nowrap flex items-center gap-2 relative group",
                pathname === "/ihtiyaclar" && "text-red-600 dark:text-red-600"
              )}
            >
              <Heart className="w-4 h-4" />
              <span>İhtiyaçlar</span>
              <div className={cn(
                "absolute -bottom-[1.45rem] left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left",
                pathname === "/ihtiyaclar" && "scale-x-100"
              )} />
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-[rgb(28,28,28)] pl-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                currentLang === 'tr' && "bg-accent"
              )}
              onClick={() => setCurrentLang('tr')}
            >
              <ReactCountryFlag countryCode="TR" svg className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                currentLang === 'en' && "bg-accent"
              )}
              onClick={() => setCurrentLang('en')}
            >
              <ReactCountryFlag countryCode="GB" svg className="w-5 h-5" />
            </Button>
            <div className="border-l border-gray-200 dark:border-[rgb(28,28,28)] pl-2">
              <ModeToggle />
            </div>
          </div>

          {session ? (
            <>
              <Link 
                href="/profil" 
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-600 transition-colors whitespace-nowrap"
              >
                <User className="w-5 h-5" />
              </Link>
              <Button 
                variant="outline"
                onClick={() => signOut()}
                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white whitespace-nowrap flex items-center gap-2 hover:text-white/90"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={() => setShowLoginModal(true)}
                className="h-9 px-4 text-gray-700 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-[rgb(28,28,28)] whitespace-nowrap flex items-center gap-2 hover:bg-gray-100/80"
              >
                <LogIn className="w-4 h-4" />
                <span>Giriş Yap</span>
              </Button>
              <Button 
                variant="default"
                onClick={() => setShowRegisterModal(true)}
                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white whitespace-nowrap flex items-center gap-2 hover:text-white/90"
              >
                <UserPlus className="w-4 h-4" />
                <span>Kayıt Ol</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <LoginModal show={showLoginModal} handleClose={() => setShowLoginModal(false)} />
      <RegisterModal show={showRegisterModal} handleClose={() => setShowRegisterModal(false)} />
    </header>
  );
} 