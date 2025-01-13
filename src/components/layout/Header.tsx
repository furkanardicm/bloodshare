'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ReactCountryFlag from 'react-country-flag';
import { useTheme } from 'next-themes';
import { 
  Menu, 
  X, 
  User, 
  LogIn, 
  LogOut, 
  Heart,
  Droplet,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'tr', name: 'Türkçe', flag: 'TR' },
  { code: 'en', name: 'English', flag: 'GB' },
];

export default function Header() {
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <header className="fixed w-full top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Lifeflow</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Give Blood, Save Lives</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/bagiscilar" 
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium px-2 py-2"
              >
                <Heart className="w-4 h-4" />
                <span>Bağışçılar</span>
              </Link>
              <Link 
                href="/ihtiyaclar" 
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium px-2 py-2"
              >
                <User className="w-4 h-4" />
                <span>İhtiyaçlar</span>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/40 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Language Selector */}
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-black/40 transition-colors duration-300">
                  <ReactCountryFlag 
                    countryCode={languages.find(lang => lang.code === currentLang)?.flag || 'TR'} 
                    svg 
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">{languages.find(lang => lang.code === currentLang)?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setCurrentLang(lang.code)}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-black/40 text-gray-700 dark:text-gray-300"
                    >
                      <ReactCountryFlag countryCode={lang.flag} svg />
                      <span className="text-sm font-medium">
                        {lang.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth Buttons */}
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/profil/isteklerim"
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 flex items-center space-x-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{session.user?.name}</span>
                  </Link>
                  <button
                    onClick={() => signOut({ redirect: false }).then(() => window.location.reload())}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLoginClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Giriş Yap</span>
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="border border-red-600 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Kayıt Ol</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/40 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-black/40 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <Link 
                href="/bagiscilar" 
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium px-2 py-2"
              >
                <Heart className="w-4 h-4" />
                <span>Bağışçılar</span>
              </Link>
              <Link 
                href="/ihtiyaclar" 
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium px-2 py-2"
              >
                <User className="w-4 h-4" />
                <span>İhtiyaçlar</span>
              </Link>
              <div className="flex items-center justify-between py-2 px-2">
                <div className="flex items-center space-x-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setCurrentLang(lang.code)}
                      className={`p-2 rounded-lg ${currentLang === lang.code ? 'bg-gray-100 dark:bg-black/60' : ''}`}
                    >
                      <ReactCountryFlag countryCode={lang.flag} svg />
                    </button>
                  ))}
                </div>
              </div>
              {session ? (
                <div className="space-y-2 px-2">
                  <Link 
                    href="/profil/isteklerim"
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{session.user?.name}</span>
                  </Link>
                  <button
                    onClick={() => signOut({ redirect: false }).then(() => window.location.reload())}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-2">
                  <button
                    onClick={handleLoginClick}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Giriş Yap</span>
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="w-full border border-red-600 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Kayıt Ol</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Modals */}
      <LoginModal 
        show={showLoginModal} 
        handleClose={() => setShowLoginModal(false)} 
      />
      <RegisterModal 
        show={showRegisterModal} 
        handleClose={() => setShowRegisterModal(false)} 
      />
    </>
  );
} 