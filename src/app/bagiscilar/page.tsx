'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bağışçılar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kan bağışçılarını görüntüleyin ve iletişime geçin.
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800 py-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Şehir ara..."
                className="pl-9 bg-white dark:bg-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger>
                  <SelectValue placeholder="Kan grubu seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
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
        </div>

        {/* Content */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Bağışçı Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDonors.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                Aradığınız kriterlere uygun bağışçı bulunamadı.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDonors.map((donor) => (
                  <div
                    key={donor._id}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {donor.name}
                      </h3>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        {donor.bloodType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {donor.city}
                    </p>
                    {donor.lastDonationDate && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
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