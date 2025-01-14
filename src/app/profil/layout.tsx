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
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-[rgb(28,28,28)]",
                  isActive && "bg-accent text-accent-foreground dark:bg-[rgb(28,28,28)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.title}
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