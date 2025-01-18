"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, CheckCircle, MessageSquare, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface BloodRequest {
  _id: string
  userId: string
  requesterName: string
  bloodType: string
  hospital: string
  city: string
  units: number
  description: string
  contact: string
  status: string
  createdAt: string
  donors?: Array<{
    email: string
    status: string
  }>
}

function maskName(name: string): string {
  if (!name || name === 'İsimsiz') return 'İsimsiz';
  
  const parts = name.split(' ');
  if (parts.length === 0) return 'İsimsiz';
  
  const maskedParts = parts.map(part => {
    if (part.length <= 2) return part;
    return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
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
  const { data: session } = useSession()

  // Benzersiz şehirleri al ve alfabetik sırala
  const uniqueCities = Array.from(new Set(requests.map(request => request.city)))
    .sort((a, b) => a.localeCompare(b, 'tr'))

  // Kullanıcının bağışçı olduğu ilanları kontrol et
  const isUserDonor = (request: BloodRequest) => {
    return request.donors?.some(donor => donor.email === session?.user?.email);
  };

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/blood-requests/active')
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'İhtiyaçlar yüklenirken bir hata oluştu');
        }
        const data = await response.json()
        console.log("Gelen veriler:", data);
        setRequests(data)
      } catch (error) {
        console.error("Hata detayı:", error);
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
      (request.city?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (request.hospital?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (request.bloodType?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (request.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesBloodType = bloodType === "all" || request.bloodType === bloodType;
    const matchesCity = !city || request.city === city;
    const isActive = request.status === 'active';

    return matchesSearch && matchesBloodType && matchesCity && isActive;
  });

  const handleDonorSignup = async (requestId: string) => {
    try {
      if (!session?.user?.email) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: "Bağışçı olmak için giriş yapmalısınız."
        })
        return
      }

      const response = await fetch(`/api/blood-requests/${requestId}/donors`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Bağışçı kaydı yapılırken bir hata oluştu')
      }
      
      // İlanı güncelle
      const currentRequest = requests.find(req => req._id === requestId);
      if (currentRequest) {
        const updatedRequest = {
          ...currentRequest,
          donors: [...(currentRequest.donors || []), {
            email: session.user.email,
            status: 'pending'
          }]
        };
        setRequests(prev => prev.map(req => 
          req._id === requestId ? updatedRequest : req
        ));
      }

      toast({
        title: "Başarılı!",
        description: "Bağış talebiniz kaydedildi.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Bir hata oluştu'
      })
    }
  }

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/complete`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('İstek tamamlanırken bir hata oluştu')
      
      const updatedRequest = await response.json()
      setRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: 'completed' } : req
      ))

      toast({
        title: "Başarılı!",
        description: "Kan bağışı tamamlandı olarak işaretlendi.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Bir hata oluştu'
      })
    }
  }

  if (loading) {
    return <LoadingSpinner centered size="lg" />
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
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Şehir veya hastane ara..."
                className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select
                  className="h-10 w-full md:w-[180px] rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="all">Tüm Kan Grupları</option>
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
              <div className="relative flex-1 md:flex-none">
                <select
                  className="h-10 w-full md:w-[180px] rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Tüm Şehirler</option>
                  {uniqueCities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-background">
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
                    className="p-4 border border-border rounded-lg bg-card"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {request.hospital} - {request.city}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.createdAt), "d MMMM yyyy", {
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400 whitespace-nowrap">
                        {request.bloodType}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2 line-clamp-2">
                      {request.description}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <p className="truncate">İhtiyaç: {request.units} ünite</p>
                      <p className="truncate">İletişim: {request.contact}</p>
                      <p className="truncate">İsteyen: {maskName(request.requesterName)}</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Bağışçılar:</span>
                          <span className="font-medium">{request.donors?.length || 0} Bağışçı</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {request.userId === session?.user?.id ? (
                            request.status !== 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleCompleteRequest(request._id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                İsteği Tamamla
                              </Button>
                            )
                          ) : (
                            <>
                              {request.status !== 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleDonorSignup(request._id)}
                                  disabled={isUserDonor(request)}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  {isUserDonor(request) ? 'Bağışçı Olundu' : 'Bağışçı Ol'}
                                </Button>
                              )}
                              <div className="flex gap-2">
                                <Link 
                                  href={`/profil/mesajlar?userId=${request.userId}`}
                                  className="flex-1"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex items-center justify-center gap-2"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Mesaj Gönder</span>
                                  </Button>
                                </Link>
                                <Link 
                                  href={`/profil/${request.userId}`}
                                  className="flex-1"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex items-center justify-center gap-2"
                                  >
                                    <User className="w-4 h-4" />
                                    <span>Profili Gör</span>
                                  </Button>
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
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