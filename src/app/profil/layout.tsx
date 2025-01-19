'use client';

import Link from 'next/link';
import { User, Heart, History, Settings, Menu, ChevronRight, ListTodo, MessageSquare, LogOut, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'
import { Badge } from "@/components/ui/badge";
import { useSession } from 'next-auth/react';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Breadcrumb items'ları oluştur
  const breadcrumbItems = [
    { title: 'Ana Sayfa', href: '/' },
    { title: 'Profil', href: '/profil' },
  ]

  // Mevcut sayfaya göre breadcrumb'ı güncelle
  if (pathname.match(/\/isteklerim\/[^/]+\/bagiscilar/)) {
    const requestId = pathname.split('/')[3]; // URL'den istek ID'sini al
    breadcrumbItems.push(
      { title: 'İsteklerim', href: '/profil/isteklerim' },
      { title: 'Bağışçılar', href: pathname }
    )
  } else if (pathname.includes('/isteklerim')) {
    breadcrumbItems.push({ title: 'İsteklerim', href: '/profil/isteklerim' })
  } else if (pathname.includes('/bagislarim')) {
    breadcrumbItems.push({ title: 'Bağışlarım', href: '/profil/bagislarim' })
  } else if (pathname.includes('/gecmis')) {
    breadcrumbItems.push({ title: 'Geçmiş', href: '/profil/gecmis' })
  } else if (pathname.includes('/ayarlar')) {
    breadcrumbItems.push({ title: 'Ayarlar', href: '/profil/ayarlar' })
  } else if (pathname.includes('/mesajlar')) {
    breadcrumbItems.push({ title: 'Mesajlar', href: '/profil/mesajlar' })
  }

  const isActive = (path: string) => {
    if (!pathname) return false;
    // İsteklerim/[requestId]/bagiscilar için özel kontrol
    if (path === '/profil/isteklerim' && pathname.includes('/isteklerim/')) {
      return true;
    }
    return pathname === path;
  };

  const menuItems = [
    {
      title: 'Profilim',
      href: '/profil',
      icon: User,
      active: isActive('/profil')
    },
    {
      title: 'İsteklerim',
      href: '/profil/isteklerim',
      icon: ListTodo,
      active: isActive('/profil/isteklerim')
    },
    {
      title: 'Bağışlarım',
      href: '/profil/bagislarim',
      icon: Gift,
      active: isActive('/profil/bagislarim')
    },
    {
      title: 'Geçmişim',
      href: '/profil/gecmis',
      icon: History,
      active: isActive('/profil/gecmis')
    },
    {
      title: 'Mesajlar',
      href: '/profil/mesajlar',
      icon: MessageSquare,
      active: isActive('/profil/mesajlar')
    },
    {
      title: 'Ayarlar',
      href: '/profil/ayarlar',
      icon: Settings,
      active: isActive('/profil/ayarlar')
    }
  ];

  // Okunmamış mesaj sayısını al
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/messages/unread-count');
        if (response.ok) {
          const { count } = await response.json();
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Okunmamış mesaj sayısı alınamadı:', error);
      }
    };

    fetchUnreadCount();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [session?.user]);

  return (
    <div className="min-h-screen bg-background dark:bg-[rgb(22,22,22)]">
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background dark:bg-[rgb(22,22,22)] dark:border-[rgb(28,28,28)] transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar açma/kapama butonu */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "absolute -right-7 top-12 p-1.5 rounded-r-md bg-card dark:bg-[rgb(22,22,22)] border border-l-0 border-border dark:border-[rgb(28,28,28)] transition-transform duration-300",
            !isSidebarOpen && "-right-9"
          )}
        >
          <ChevronRight className={cn(
            "w-4 h-4 transition-transform duration-300",
            isSidebarOpen && "rotate-180"
          )} />
        </button>

        <nav className="space-y-2 p-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  item.active ? "bg-accent" : ""
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.title}</span>
                {item.title === "Mesajlar" && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs p-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={cn(
        "min-h-screen pt-20 transition-all duration-300 bg-background dark:bg-[rgb(22,22,22)]",
        isSidebarOpen ? "lg:pl-64" : "pl-0"
      )}>
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb items={breadcrumbItems} />
          {children}
        </div>
      </main>
    </div>
  );
} 