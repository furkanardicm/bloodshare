"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewRequestPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      bloodType: formData.get("bloodType"),
      hospital: formData.get("hospital"),
      city: formData.get("city"),
      units: Number(formData.get("units")),
      description: formData.get("description"),
      contact: formData.get("contact"),
    }

    try {
      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Bir hata oluştu")
      }

      toast({
        title: "Başarılı!",
        description: "Kan bağışı isteğiniz oluşturuldu.",
      })

      router.push("/profil/isteklerim")
      router.refresh()
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Kan bağışı isteği oluşturulamadı.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Kan Bağışı İsteği</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Kan Grubu</Label>
              <Select name="bloodType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Kan grubu seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="0+">0+</SelectItem>
                  <SelectItem value="0-">0-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hastane</Label>
              <Input id="hospital" name="hospital" placeholder="Hastane adı" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input id="city" name="city" placeholder="Şehir" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">İhtiyaç Duyulan Ünite</Label>
              <Input
                type="number"
                id="units"
                name="units"
                placeholder="Ünite sayısı"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="İsteğinizle ilgili detaylı bilgi verin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">İletişim Bilgileri</Label>
              <Input
                id="contact"
                name="contact"
                placeholder="Telefon numarası"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "İsteği Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 