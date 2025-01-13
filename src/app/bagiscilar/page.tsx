'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"

interface User {
  _id: string
  name: string
  bloodType: string
  city: string
  lastDonationDate: string | null
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bloodType, setBloodType] = useState<string>("all")
  const [city, setCity] = useState<string>("")
  const { toast } = useToast()

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
    const matchesSearch = donor.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBloodType = bloodType === "all" || donor.bloodType === bloodType
    return matchesSearch && matchesBloodType
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Şehir ara..."
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
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  <option value="izmir">İzmir</option>
                  <option value="bursa">Bursa</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-[rgb(13,13,13)]">
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
                  <div
                    key={donor._id}
                    className="p-4 border border-border rounded-lg bg-[rgb(17,17,19)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">
                        {donor.name}
                      </h3>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        {donor.bloodType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {donor.city}
                    </p>
                    {donor.lastDonationDate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Son bağış: {new Date(donor.lastDonationDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}
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