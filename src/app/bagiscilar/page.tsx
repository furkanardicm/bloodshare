'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface User {
  _id: string
  name: string
  bloodType: string
  city?: string
  lastDonationDate: string | null
  image: string
}

// Sabit renk listesi
const AVATAR_COLORS = [
  { bg: 'from-red-400 to-red-600', text: 'text-white' },
  { bg: 'from-green-400 to-green-600', text: 'text-white' },
  { bg: 'from-blue-400 to-blue-600', text: 'text-white' },
  { bg: 'from-yellow-400 to-yellow-600', text: 'text-black' },
  { bg: 'from-purple-400 to-purple-600', text: 'text-white' },
  { bg: 'from-pink-400 to-pink-600', text: 'text-white' },
  { bg: 'from-indigo-400 to-indigo-600', text: 'text-white' },
  { bg: 'from-orange-400 to-orange-600', text: 'text-white' },
  { bg: 'from-teal-400 to-teal-600', text: 'text-white' },
  { bg: 'from-cyan-400 to-cyan-600', text: 'text-white' },
];

// Kullanıcı ID'sine göre sabit renk seçen fonksiyon
function getAvatarColor(userId: string): { bg: string; text: string } {
  const sum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodType, setBloodType] = useState<string>("all")
  const [city, setCity] = useState<string>("")
  const { toast } = useToast()

  // Benzersiz şehirleri al ve alfabetik sırala
  const uniqueCities = Array.from(new Set(donors.filter(donor => donor.city).map(donor => donor.city)))
    .sort((a, b) => a!.localeCompare(b!, 'tr'))

  useEffect(() => {
    async function fetchDonors() {
      try {
        const response = await fetch('/api/users/donors')
        if (!response.ok) throw new Error('Bağışçılar yüklenirken bir hata oluştu')
        const data = await response.json()
        setDonors(data)
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

    fetchDonors()
  }, [toast])

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = donor.city ? donor.city.toLowerCase().includes(searchQuery.toLowerCase()) : false
    const matchesBloodType = bloodType === "all" || donor.bloodType === bloodType
    const matchesCity = !city || (donor.city && donor.city.toLowerCase() === city.toLowerCase())
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
            Bağışçılar
          </h1>
          <p className="text-muted-foreground">
            Kan bağışçılarını görüntüleyin ve iletişime geçin.
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-20 z-10 bg-background border-y border-border py-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Bağışçı ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus-visible:outline-none"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial min-w-[150px]">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">Tüm şehirler</option>
                      {uniqueCities.map((cityName) => (
                        <option key={cityName} value={cityName || "all"}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1 sm:flex-initial min-w-[150px]">
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">Tüm kan grupları</option>
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
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-background">
          <CardHeader>
            <CardTitle>Bağışçı Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDonors.length === 0 ? (
              <p className="text-muted-foreground">
                Aradığınız kriterlere uygun bağışçı bulunamadı.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDonors.map((donor) => (
                  <Link 
                    key={donor._id} 
                    href={`/profil/${donor._id}`}
                    className="block hover:opacity-90 transition-opacity"
                  >
                    <Card className="border dark:border-gray-800">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800 shadow-inner">
                            <AvatarImage src={donor.image} />
                            <AvatarFallback 
                              className={`text-lg bg-gradient-to-br ${getAvatarColor(donor._id).bg} ${getAvatarColor(donor._id).text} shadow-inner`}
                            >
                              {donor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{donor.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {donor.bloodType} Kan Grubu
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 