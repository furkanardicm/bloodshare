'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/loading";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Droplets, Calendar, MapPin, Clock, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { getAvatarColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bloodType?: string;
  city?: string;
  memberSince: string;
  isDonor: boolean;
  stats: {
    totalDonations: number;
    completedDonations: number;
    pendingDonations: number;
    urgentDonations: number;
    lastDonationDate: string | null;
    mostDonatedBloodType: string | null;
    recentDonations: Array<{
      _id: string;
      bloodType: string;
      createdAt: string;
      status: string;
    }>;
    totalRequests: number;
  };
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch(`/api/users/profile/${params.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Kullanıcı bilgileri yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error instanceof Error ? error.message : 'Bir hata oluştu'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [params.id, toast]);

  if (loading) {
    return <LoadingSpinner centered size="lg" />;
  }

  if (!user || !user.stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Kullanıcı bilgileri yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <Avatar className="h-24 w-24 shadow-lg">
        <AvatarImage src={user.image} />
        <AvatarFallback 
          className={`text-3xl bg-gradient-to-br ${getAvatarColor(user._id).bg} ${getAvatarColor(user._id).text}`}
        >
          {user.name.split(' ').map((n: string) => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <div className="flex items-center justify-center gap-2">
          {user.bloodType && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
              <Droplets className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">
                {user.bloodType}
              </span>
            </div>
          )}
          {user.isDonor && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-500">
                Kan Bağışçısı
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.city && (
            <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Şehir:</span>
              <span className="font-medium">{user.city}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Üyelik:</span>
            <span className="font-medium">
              {format(new Date(user.memberSince), 'MMMM yyyy', { locale: tr })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-red-500">{user.stats.completedDonations}</div>
            <div className="text-sm text-muted-foreground mt-1">Tamamlanan Bağış</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-yellow-500">{user.stats.pendingDonations}</div>
            <div className="text-sm text-muted-foreground mt-1">Bekleyen Bağış</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-red-500">{user.stats.totalRequests}</div>
            <div className="text-sm text-muted-foreground mt-1">Toplam İstek</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-red-500">
              {user.stats.totalDonations}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Toplam Bağış
            </div>
          </div>
        </div>

        {user.stats.mostDonatedBloodType && (
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2">
              <Droplets className="w-5 h-5 text-red-500" />
              <div className="text-lg font-bold text-red-500">{user.stats.mostDonatedBloodType}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">En Çok Bağışladığı Kan Grubu</div>
          </div>
        )}

        <Link href={`/profil/mesajlar?userId=${user._id}`} className="block">
          <Button 
            variant="destructive" 
            className="w-full flex items-center justify-center gap-2 mt-4"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mesaj Gönder</span>
          </Button>
        </Link>
      </div>
    </div>
  );
} 