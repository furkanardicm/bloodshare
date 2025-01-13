'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [bloodType, setBloodType] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-2">
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Hesap Ayarları
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Profil bilgilerinizi güncelleyin ve hesap ayarlarınızı yönetin.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" placeholder="Ad Soyad" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" placeholder="E-posta" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="Telefon" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" />
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
                <Button>Değişiklikleri Kaydet</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Şifre Değiştir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input id="currentPassword" type="password" placeholder="Mevcut şifreniz" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input id="newPassword" type="password" placeholder="Yeni şifreniz" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input id="confirmPassword" type="password" placeholder="Yeni şifrenizi tekrar girin" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" />
              </div>
              <div className="flex justify-end">
                <Button>Şifreyi Güncelle</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tema
                </label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Açık</option>
                  <option value="dark">Koyu</option>
                  <option value="system">Sistem</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 