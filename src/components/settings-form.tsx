'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Save, Lock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function SettingsForm() {
  const [bloodType, setBloodType] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'profile' | 'password'>('profile');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (!response.ok) {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
        const data = await response.json();
        setUserData(data);
        setBloodType(data.bloodType || '');
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Kullanıcı bilgileri yüklenirken bir hata oluştu');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = (type: 'profile' | 'password') => {
    setDialogAction(type);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    try {
      if (dialogAction === 'profile') {
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            bloodType
          }),
        });

        if (!response.ok) {
          throw new Error('Profil güncellenemedi');
        }

        toast.success('Profil başarıyla güncellendi');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Bir hata oluştu');
    }
    setShowConfirmDialog(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input 
                id="name" 
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                placeholder="Ad Soyad" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email" 
                type="email" 
                value={userData.email}
                disabled
                placeholder="E-posta" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder="Telefon" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">Kan Grubu</Label>
              <select
                id="bloodType"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
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
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleSave('profile')}>
              <Save className="mr-2 h-4 w-4" />
              Değişiklikleri Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Şifre Değiştir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mevcut Şifre</Label>
            <Input id="currentPassword" type="password" placeholder="Mevcut şifreniz" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni Şifre</Label>
            <Input id="newPassword" type="password" placeholder="Yeni şifreniz" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
            <Input id="confirmPassword" type="password" placeholder="Yeni şifrenizi tekrar girin" />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleSave('password')}>
              <Lock className="mr-2 h-4 w-4" />
              Şifreyi Güncelle
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Tema Seçimi</Label>
              <p className="text-sm text-muted-foreground">
                Açık veya koyu tema seçimi yapabilirsiniz.
              </p>
            </div>
            <ModeToggle />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'profile' 
                ? 'Profil bilgilerinizi güncellemek istediğinize emin misiniz?' 
                : 'Şifrenizi değiştirmek istediğinize emin misiniz?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Devam Et</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 