'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4">
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
                  <Select>
                    <SelectTrigger id="bloodType" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <SelectValue placeholder="Kan grubu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A Rh+</SelectItem>
                      <SelectItem value="A-">A Rh-</SelectItem>
                      <SelectItem value="B+">B Rh+</SelectItem>
                      <SelectItem value="B-">B Rh-</SelectItem>
                      <SelectItem value="AB+">AB Rh+</SelectItem>
                      <SelectItem value="AB-">AB Rh-</SelectItem>
                      <SelectItem value="0+">0 Rh+</SelectItem>
                      <SelectItem value="0-">0 Rh-</SelectItem>
                    </SelectContent>
                  </Select>
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
        </div>
      </div>
    </div>
  )
} 