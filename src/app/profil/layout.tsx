'use client';

import Link from 'next/link';
import { User, Heart, History, Settings, Menu, ChevronRight, ListTodo } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // Breadcrumb items'ları oluştur
  const breadcrumbItems = [
    { title: 'Ana Sayfa', href: '/' },
    { title: 'Profil', href: '/profil' },
  ]

  // Mevcut sayfaya göre breadcrumb'ı güncelle
  if (pathname.includes('/isteklerim')) {
    breadcrumbItems.push({ title: 'İsteklerim', href: '/profil/isteklerim' })
  } else if (pathname.includes('/gecmis')) {
    breadcrumbItems.push({ title: 'Geçmiş', href: '/profil/gecmis' })
  } else if (pathname.includes('/ayarlar')) {
    breadcrumbItems.push({ title: 'Ayarlar', href: '/profil/ayarlar' })
  }

  const menuItems = [
    {
      title: "Profilim",
      href: "/profil",
      icon: User,
    },
    {
      title: "İsteklerim",
      href: "/profil/isteklerim",
      icon: ListTodo,
    },
    {
      title: "Bağışlarım",
      href: "/profil/bagislarim",
      icon: Heart,
    },
    {
      title: "Geçmiş",
      href: "/profil/gecmis",
      icon: History,
    },
    {
      title: "Ayarlar",
      href: "/profil/ayarlar",
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r border-border bg-card transition-transform duration-300 z-40",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar açma/kapama butonu */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "absolute -right-7 top-12 p-1.5 rounded-r-md bg-card border border-l-0 border-border transition-transform duration-300",
            !isSidebarOpen && "-right-9"
          )}
        >
          <ChevronRight className={cn(
            "w-4 h-4 transition-transform duration-300",
            isSidebarOpen && "rotate-180"
          )} />
        </button>

        <nav className="flex flex-col gap-2 p-4">
          <Link
            href="/profil"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/profil" && "bg-accent text-accent-foreground"
            )}
          >
            <User className="w-4 h-4" />
            Profil
          </Link>
          <Link
            href="/profil/isteklerim"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/profil/isteklerim" && "bg-accent text-accent-foreground"
            )}
          >
            <Heart className="w-4 h-4" />
            İsteklerim
          </Link>
          <Link
            href="/profil/gecmis"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/profil/gecmis" && "bg-accent text-accent-foreground"
            )}
          >
            <History className="w-4 h-4" />
            Geçmiş
          </Link>
          <Link
            href="/profil/ayarlar"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/profil/ayarlar" && "bg-accent text-accent-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            Ayarlar
          </Link>
        </nav>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={cn(
        "min-h-screen pt-20 transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb items={breadcrumbItems} />
          {children}
        </div>
      </main>
    </div>
  );
} 