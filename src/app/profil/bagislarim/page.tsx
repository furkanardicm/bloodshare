'use client';

import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"
import { CheckCircle, Clock, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { BloodRequest } from "@/types/user"

export default function DonationsPage() {
  const [donations, setDonations] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchDonations() {
      try {
        const response = await fetch('/api/blood-requests/my-donations')
        if (!response.ok) throw new Error('Bağışlar yüklenirken bir hata oluştu')
        const data = await response.json()
        setDonations(data)
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

    fetchDonations()
  }, [toast])

  const handleCompleteDonation = async (requestId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/complete-donation`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Bağış tamamlanırken bir hata oluştu')
      
      const updatedRequest = await response.json()
      setDonations(prev => prev.map(donation => 
        donation._id === requestId ? updatedRequest : donation
      ))

      toast({
        title: "Başarılı!",
        description: "Bağışınız tamamlandı olarak işaretlendi.",
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
          { title: "Bağışlarım" }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Bağışlarım</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-muted-foreground">Henüz bir bağışınız bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation._id}
                  className="p-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {donation.hospital} - {donation.city}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(donation.createdAt), "d MMMM yyyy", {
                          locale: tr,
                        })}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      {donation.bloodType}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    <p>{donation.description}</p>
                    <p className="mt-2">İhtiyaç: {donation.units} ünite</p>
                    <div className="flex items-center mt-1">
                      <span>Durum:</span>
                      {donation.status === "completed" ? (
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

                  {donation.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteDonation(donation._id)}
                      className="w-full"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Bağışı Tamamla
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 