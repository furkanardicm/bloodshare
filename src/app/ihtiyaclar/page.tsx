"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface BloodRequest {
  _id: string
  userId: {
    _id: string
    name: string
  }
  bloodType: string
  hospital: string
  city: string
  units: number
  description: string
  contact: string
  status: string
  createdAt: string
}

function maskName(name: string): string {
  if (!name) return 'İsimsiz';
  const parts = name.split(' ');
  const maskedParts = parts.map(part => {
    if (part.length <= 1) return part;
    return part[0] + '*'.repeat(part.length - 1);
  });
  return maskedParts.join(' ');
}

export default function NeedsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodType, setBloodType] = useState<string>("all")
  const [city, setCity] = useState<string>("")
  const { toast } = useToast()

  // Benzersiz şehirleri al ve alfabetik sırala
  const uniqueCities = Array.from(new Set(requests.map(request => request.city)))
    .sort((a, b) => a.localeCompare(b, 'tr'))

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/blood-requests/active')
        if (!response.ok) throw new Error('İhtiyaçlar yüklenirken bir hata oluştu')
        const data = await response.json()
        setRequests(data)
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

    fetchRequests()
  }, [toast])

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.hospital.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBloodType = bloodType === "all" || request.bloodType === bloodType
    const matchesCity = !city || request.city.toLowerCase() === city.toLowerCase()
    return matchesSearch && matchesBloodType && matchesCity
  })

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Kan İhtiyaçları
          </h1>
          <p className="text-muted-foreground">
            Acil kan ihtiyaçlarını görüntüleyin ve bağışta bulunun.
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-20 z-10 bg-background border-y border-border py-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Şehir veya hastane ara..."
                className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  className="h-10 w-[180px] rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="">Kan Grubu</option>
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
              <div className="relative">
                <select
                  className="h-10 w-[180px] rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Şehir</option>
                  {uniqueCities.map((cityName) => (
                    <option key={cityName} value={cityName.toLowerCase()}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-[rgb(13,13,13)]">
          <CardHeader>
            <CardTitle>İhtiyaç Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <p className="text-muted-foreground">
                Aradığınız kriterlere uygun kan ihtiyacı bulunamadı.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className="p-4 border border-border rounded-lg bg-[rgb(17,17,19)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {request.hospital} - {request.city}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.createdAt), "d MMMM yyyy", {
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        {request.bloodType}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2">
                      {request.description}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <p>İhtiyaç: {request.units} ünite</p>
                      <p>İletişim: {request.contact}</p>
                      <p>İsteyen: {maskName(request.userId.name)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 