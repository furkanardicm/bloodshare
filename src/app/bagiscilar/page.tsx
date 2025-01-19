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
import { bloodTypes } from '@/lib/constants'
import { DonorCard } from '@/components/ui/donor-card'

interface User {
  _id: string
  name: string
  bloodType: string
  city: string
  lastDonationDate?: Date
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
  const [city, setCity] = useState<string>("all")
  const [allCities, setAllCities] = useState<string[]>([])
  const { toast } = useToast()

  // İlk yüklemede tüm bağışçıları ve şehirleri getir
  useEffect(() => {
    async function fetchDonors() {
      try {
        setLoading(true);
        const response = await fetch('/api/users/donors');
        if (!response.ok) throw new Error('Bağışçılar yüklenirken bir hata oluştu');
        const data = await response.json();
        setDonors(data);
        
        // Benzersiz şehirleri al ve alfabetik sırala
        const cities = Array.from(new Set(data
          .filter((donor: User) => donor.city)
          .map((donor: User) => donor.city))) as string[];
        cities.sort((a, b) => a.localeCompare(b, 'tr'));
        setAllCities(cities);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error instanceof Error ? error.message : 'Bir hata oluştu'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDonors();
  }, [toast]); // Sadece component mount olduğunda çalışsın

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = donor.city ? donor.city.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesBloodType = bloodType === "all" || donor.bloodType === bloodType;
    const matchesCity = city === "all" || (donor.city && donor.city === city);
    return matchesSearch && matchesBloodType && matchesCity;
  });

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
                {/* Arama */}
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Şehir ara..."
                    className="pl-8 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus-visible:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Kan Grubu Filtresi */}
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger className="w-full sm:w-[180px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Kan grubu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kan Grupları</SelectItem>
                    {bloodTypes.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Şehir Filtresi */}
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="w-full sm:w-[180px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Şehir seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Şehirler</SelectItem>
                    {allCities.map((cityName) => (
                      <SelectItem key={cityName} value={cityName}>
                        {cityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Donor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredDonors.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-muted-foreground">
                    Bağışçı bulunamadı
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          ) : (
            filteredDonors.map((donor) => (
              <DonorCard key={donor._id} donor={donor} />
            ))
          )}
        </div>
      </div>
    </div>
  )
} 