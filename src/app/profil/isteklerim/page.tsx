'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface BloodRequest {
  _id: string
  userId: string
  bloodType: string
  hospital: string
  city: string
  units: number
  description: string
  contact: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/blood-requests/my')
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

  const activeRequests = requests.filter((req) => req.status === "active")
  const completedRequests = requests.filter((req) => req.status !== "active")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bağış İsteklerim
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Oluşturduğunuz kan bağışı isteklerini görüntüleyin ve yönetin.
            </p>
          </div>
          <Link href="/profil/isteklerim/yeni">
            <Button>
              Yeni İstek Oluştur
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Aktif İstekler</CardTitle>
            </CardHeader>
            <CardContent>
              {activeRequests.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Henüz aktif bir kan bağışı isteğiniz bulunmuyor.
                </p>
              ) : (
                <div className="space-y-4">
                  {activeRequests.map((request) => (
                    <div
                      key={request._id.toString()}
                      className="flex flex-col space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex justify-between items-start">
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
                      <p className="text-sm text-gray-700 dark:text-gray-300">{request.description}</p>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>İhtiyaç: {request.units} ünite</p>
                        <p>İletişim: {request.contact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Geçmiş İstekler</CardTitle>
            </CardHeader>
            <CardContent>
              {completedRequests.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Henüz tamamlanmış bir kan bağışı isteğiniz bulunmuyor.
                </p>
              ) : (
                <div className="space-y-4">
                  {completedRequests.map((request) => (
                    <div
                      key={request._id.toString()}
                      className="flex flex-col space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 opacity-60"
                    >
                      <div className="flex justify-between items-start">
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
                      <p className="text-sm text-gray-700 dark:text-gray-300">{request.description}</p>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>İhtiyaç: {request.units} ünite</p>
                        <p>İletişim: {request.contact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 