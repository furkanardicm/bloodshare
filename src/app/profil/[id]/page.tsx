'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/loading";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Droplets, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { getAvatarColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bloodType?: string;
  city?: string;
  lastDonationDate?: string;
  donationCount?: number;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch(`/api/users/${params.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Kullanıcı bilgileri yüklenirken bir hata oluştu');
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

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Kullanıcı bulunamadı.</p>
      </div>
    );
  }

  const daysSinceLastDonation = user.lastDonationDate ? 
    Math.floor((new Date().getTime() - new Date(user.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)) : null;

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
        {user.bloodType && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
            <Droplets className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">
              {user.bloodType}
            </span>
          </div>
        )}
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
          
          {user.lastDonationDate && (
            <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Son Bağış:</span>
              <span className="font-medium">
                {new Date(user.lastDonationDate).toLocaleDateString('tr-TR')}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-red-500">{user.donationCount || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">Toplam Bağış</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-red-500">
              {daysSinceLastDonation ?? 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {daysSinceLastDonation !== null ? 'Gündür Bağış Yapmadı' : 'Henüz Bağış Yapmadı'}
            </div>
          </div>
        </div>

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