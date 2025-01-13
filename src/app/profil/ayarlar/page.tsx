'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      toast({
        title: "Bilgi",
        description: "Şifre değiştirme özelliği henüz aktif değil.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Bir hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Şifre Değiştir</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Mevcut şifrenizi girin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Yeni şifrenizi girin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Yeni şifrenizi tekrar girin"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hesap Ayarları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Bağış Yapılabilir Durumu</Label>
                <div className="mt-2">
                  <Button variant="outline" className="w-full">
                    Bağış Yapmaya Uygunum
                  </Button>
                </div>
              </div>
              <div>
                <Label>Bildirimler</Label>
                <div className="mt-2">
                  <Button variant="outline" className="w-full">
                    Bildirimleri Yönet
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 