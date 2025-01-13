"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useEffect, useState } from "react"
import { Search, MapPin, Calendar, Phone, User, Droplet } from "lucide-react"
import { cn } from "@/lib/utils"

interface BloodRequest {
  _id: string
  hospital: string
  city: string
  bloodType: string
  units: number
  description: string
  contact: string
  createdAt: string
  userId: {
    name: string
  }
}

type SortOption = "newest" | "oldest" | "city"

function maskName(name: string): string {
  if (!name) return "İsimsiz"
  const parts = name.split(" ")
  const maskedParts = parts.map(part => {
    if (part.length <= 1) return part
    return part[0] + "*".repeat(part.length - 1)
  })
  return maskedParts.join(" ")
}

export default function NeedsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [bloodType, setBloodType] = useState<string | undefined>()
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const response = await fetch("/api/blood-requests/active")
      if (!response.ok) throw new Error("Veriler alınamadı")
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error("Veri alma hatası:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedRequests = requests
    .filter((request) => {
      const matchesSearch = search === "" || 
        request.city.toLowerCase().includes(search.toLowerCase()) ||
        request.hospital.toLowerCase().includes(search.toLowerCase()) ||
        request.description.toLowerCase().includes(search.toLowerCase())
      
      const matchesBloodType = !bloodType || request.bloodType === bloodType

      return matchesSearch && matchesBloodType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "city":
          return a.city.localeCompare(b.city)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Ana Başlık */}
      <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center h-16">
            <h1 className="text-2xl font-bold tracking-tight dark:text-gray-100">
              Kan Bağışı İhtiyaçları
            </h1>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1">
        {/* Filtreleme Navbar'ı */}
        <div className="mt-2 border-y bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm dark:border-gray-800">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center gap-4 h-16">
              <div className="flex-1 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Şehir, hastane veya açıklama ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-transparent border-gray-200 dark:border-gray-800"
                  />
                </div>
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger className="w-[140px] bg-transparent border-gray-200 dark:border-gray-800">
                    <SelectValue placeholder="Kan grubu" />
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
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[140px] bg-transparent border-gray-200 dark:border-gray-800">
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">En Yeni</SelectItem>
                    <SelectItem value="oldest">En Eski</SelectItem>
                    <SelectItem value="city">Şehre Göre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="py-8">
          <div className="max-w-[1400px] mx-auto px-6">
            {filteredAndSortedRequests.length === 0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800 border-gray-200">
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    {requests.length === 0
                      ? "Şu anda aktif bir kan bağışı ihtiyacı bulunmuyor."
                      : "Arama kriterlerinize uygun ihtiyaç bulunamadı."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedRequests.map((request) => (
                  <Card 
                    key={request._id} 
                    className={cn(
                      "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
                      "hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20",
                      "transition-all duration-300",
                      "hover:-translate-y-0.5"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <CardTitle className="text-lg font-semibold dark:text-gray-100 truncate">
                            {request.hospital}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-sm truncate">{request.city}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Droplet className="h-3.5 w-3.5" />
                            {request.bloodType}
                          </div>
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4 dark:text-gray-300 line-clamp-2">{request.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {format(new Date(request.createdAt), "d MMMM yyyy", {
                              locale: tr,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{request.contact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{maskName(request.userId?.name)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 