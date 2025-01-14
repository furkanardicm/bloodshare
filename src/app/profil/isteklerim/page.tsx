'use client';

import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"
import { CheckCircle, Clock, Users, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { BloodRequest } from "@/types/user"
import Link from "next/link"
import { CITIES } from "@/lib/constants";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/blood-requests/my-requests')
        if (!response.ok) throw new Error('İstekler yüklenirken bir hata oluştu')
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

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/complete`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('İstek tamamlanırken bir hata oluştu')
      
      const updatedRequest = await response.json()
      setRequests(prev => prev.map(request => 
        request._id === requestId ? updatedRequest : request
      ))

      toast({
        title: "Başarılı!",
        description: "Bağış isteği tamamlandı olarak işaretlendi.",
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
    return <Loading />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { title: "Profil", href: "/profil" },
          { title: "İsteklerim" }
        ]}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">İsteklerim</h1>
        <Link href="/profil/isteklerim/yeni">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni İstek Oluştur
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bağış İsteklerim</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground">Henüz bir bağış isteğiniz bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 border border-border rounded-lg bg-card"
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
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      {request.bloodType}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    <p>{request.description}</p>
                    <p className="mt-2">İhtiyaç: {request.units} ünite</p>
                    <div className="flex items-center mt-1">
                      <span>Durum:</span>
                      {request.status === "completed" ? (
                        <div className="flex items-center ml-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>Tamamlandı</span>
                        </div>
                      ) : (
                        <div className="flex items-center ml-2 text-yellow-600 dark:text-yellow-400">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Bekliyor</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Bağışçılar</span>
                      </div>
                      <span className="font-medium">{request.totalDonors || 0}/{request.units}</span>
                    </div>

                    {request.donors && request.donors.length > 0 && (
                      <div className="space-y-2">
                        {request.donors.map((donor, index) => (
                          <div
                            key={donor.userId + index}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                          >
                            <span className="text-sm">Bağışçı #{index + 1}</span>
                            <div className="flex items-center">
                              {donor.status === "completed" ? (
                                <span className="text-sm text-green-600 dark:text-green-400">Tamamlandı</span>
                              ) : (
                                <span className="text-sm text-yellow-600 dark:text-yellow-400">Bekliyor</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {request.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteRequest(request._id)}
                        className="w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        İsteği Tamamla
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 