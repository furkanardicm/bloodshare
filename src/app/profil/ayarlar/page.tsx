'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CITIES } from "@/lib/constants"
import { Save } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface User {
  name: string
  email: string
  phone: string
  bloodType: string
  city: string
  isDonor: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [isDonorChecked, setIsDonorChecked] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/users/me')
        if (!response.ok) throw new Error('Kullanıcı bilgileri yüklenemedi')
        const data = await response.json()
        setUser(data)
        setIsDonorChecked(Boolean(data.isDonor))
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error instanceof Error ? error.message : 'Bir hata oluştu'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        bloodType: formData.get('bloodType'),
        city: formData.get('city'),
        isDonor: isDonorChecked
      }

      console.log('Gönderilen veri:', data);

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ayarlar kaydedilemedi')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)

      toast({
        title: "Başarılı!",
        description: "Ayarlarınız kaydedildi.",
        className: "bg-red-600 text-white border-none"
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Bir hata oluştu'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return <LoadingSpinner centered size="lg" />
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Hesap Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
              />
              <p className="text-sm text-muted-foreground">
                E-posta adresi değiştirilemez
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user.phone}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <select
                id="city"
                name="city"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={user.city}
                disabled={saving}
              >
                <option value="">Şehir Seçin</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">Kan Grubu</Label>
              <div className="flex items-center justify-between gap-4">
                <select
                  id="bloodType"
                  name="bloodType"
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={user.bloodType}
                  disabled={saving}
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="isDonor">Bağışçı Olmak İstiyorum</Label>
                  <Switch
                    id="isDonor"
                    name="isDonor"
                    checked={isDonorChecked}
                    onCheckedChange={setIsDonorChecked}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2 text-current" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 