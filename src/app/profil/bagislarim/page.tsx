'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default function DonationsPage() {
  // Örnek bağış verileri
  const donations = [
    {
      id: 1,
      date: new Date(2024, 2, 15),
      hospital: "Ankara Şehir Hastanesi",
      city: "Ankara",
      bloodType: "A+",
      units: 1,
    },
    {
      id: 2,
      date: new Date(2024, 1, 20),
      hospital: "Gazi Üniversitesi Hastanesi",
      city: "Ankara",
      bloodType: "A+",
      units: 1,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bağış Geçmişim
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Geçmiş kan bağışlarınızı görüntüleyin.
          </p>
        </div>

        {/* Content */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Bağışlarım</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                Henüz bir kan bağışında bulunmamışsınız.
              </p>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex flex-col space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {donation.hospital} - {donation.city}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(donation.date, "d MMMM yyyy", {
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        {donation.bloodType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Bağış: {donation.units} ünite</p>
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