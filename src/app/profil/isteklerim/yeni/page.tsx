"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewRequestPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bloodType, setBloodType] = useState("")
  const [city, setCity] = useState("")

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Kan Grubu
                </label>
                <select
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
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Şehir
                </label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Şehir Seçin</option>
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  <option value="izmir">İzmir</option>
                  <option value="bursa">Bursa</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hastane</Label>
              <Input id="hospital" name="hospital" placeholder="Hastane adı" required />
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