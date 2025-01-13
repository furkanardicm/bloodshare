'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Heart, History, Settings } from 'lucide-react';

const menuItems = [
  {
    title: 'Profil',
    href: '/profil',
    icon: User
  },
  {
    title: 'Kan Bağışı İsteklerim',
    href: '/profil/isteklerim',
    icon: Heart
  },
  {
    title: 'Bağış Geçmişim',
    href: '/profil/bagislarim',
    icon: History
  },
  {
    title: 'Ayarlar',
    href: '/profil/ayarlar',
    icon: Settings
  }
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-500" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 