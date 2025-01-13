"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const { toast } = useToast()

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
    return matchesSearch && matchesBloodType
  })

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 mt-2">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Kan İhtiyaçları
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acil kan ihtiyaçlarını görüntüleyin ve bağışta bulunun.
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800 py-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Şehir veya hastane ara..."
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
            <CardTitle>İhtiyaç Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                Aradığınız kriterlere uygun kan ihtiyacı bulunamadı.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {request.hospital} - {request.city}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(request.createdAt), "d MMMM yyyy", {
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        {request.bloodType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {request.description}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
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