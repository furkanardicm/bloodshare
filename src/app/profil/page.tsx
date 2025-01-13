'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, Home, Edit2, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Stats {
  activeRequests: number;
  completedRequests: number;
  totalDonations: number;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  isDonor: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({ activeRequests: 0, completedRequests: 0, totalDonations: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
    bloodType: session?.user?.bloodType || '',
    isDonor: session?.user?.isDonor || false
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
    }
  }, [session?.user?.id]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/users/stats');
      if (!response.ok) throw new Error('İstatistikler getirilemedi');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'İstatistikler getirilirken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Profil güncellenemedi');

      toast({
        title: 'Başarılı',
        description: 'Profil bilgileriniz güncellendi'
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Profil güncellenirken bir hata oluştu'
      });
    }
  };

  if (!session) return null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">Profil</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Kişisel Bilgiler */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Kişisel Bilgiler</h2>
            <Button
              variant={isEditing ? "success" : "outline"}
              onClick={() => {
                if (isEditing) {
                  handleSubmit();
                } else {
                  setIsEditing(true);
                }
              }}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                !isEditing && "border-blue-500 text-blue-600 hover:border-blue-600 hover:text-blue-500 dark:border-blue-400/50 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:text-blue-300"
              )}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Kaydet</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Düzenle</span>
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Ad Soyad</label>
              {isEditing ? (
                <Input
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="bg-white dark:bg-[rgb(22,22,22)] border-gray-200 dark:border-[rgb(28,28,28)] text-gray-900 dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                <p className="text-foreground">{userData.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">E-posta</label>
              {isEditing ? (
                <Input
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="bg-white dark:bg-[rgb(22,22,22)] border-gray-200 dark:border-[rgb(28,28,28)] text-gray-900 dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                <p className="text-foreground">{userData.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Telefon</label>
              {isEditing ? (
                <Input
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="bg-white dark:bg-[rgb(22,22,22)] border-gray-200 dark:border-[rgb(28,28,28)] text-gray-900 dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                <p className="text-foreground">{userData.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Kan Grubu
                </label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={userData.bloodType}
                  onChange={(e) => setUserData({ ...userData, bloodType: e.target.value })}
                  disabled={!isEditing}
                >
                  <option value="">Kan Grubu Seçin</option>
                  <option value="A+">A RH+</option>
                  <option value="A-">A RH-</option>
                  <option value="B+">B RH+</option>
                  <option value="B-">B RH-</option>
                  <option value="AB+">AB RH+</option>
                  <option value="AB-">AB RH-</option>
                  <option value="0+">0 RH+</option>
                  <option value="0-">0 RH-</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Bağışçı Durumu
                </label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={userData.isDonor ? 'true' : 'false'}
                  onChange={(e) => setUserData({ ...userData, isDonor: e.target.value === 'true' })}
                  disabled={!isEditing}
                >
                  <option value="">Seçin</option>
                  <option value="true">Bağışçı</option>
                  <option value="false">Bağışçı Değil</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-2">Aktif İstekler</h3>
            <p className="text-3xl font-bold text-foreground">{stats.activeRequests}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-2">Tamamlanan İstekler</h3>
            <p className="text-3xl font-bold text-foreground">{stats.completedRequests}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-2">Toplam Bağış</h3>
            <p className="text-3xl font-bold text-foreground">{stats.totalDonations}</p>
          </div>
        </div>
      </div>
    </>
  );
} 