import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import BloodRequest from "@/models/BloodRequest"
import { dbConnect } from "@/lib/mongodb"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

async function getBloodRequests() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  await dbConnect()
  return BloodRequest.find({ userId: session.user.id }).sort({ createdAt: -1 })
}

export default async function RequestsPage() {
  const requests = await getBloodRequests()
  const activeRequests = requests.filter((req) => req.status === "active")
  const completedRequests = requests.filter((req) => req.status !== "active")

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Kan Bağışı İsteklerim</h1>
        <Link href="/profil/isteklerim/yeni">
          <Button>
            Yeni İstek Oluştur
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktif İstekler</CardTitle>
        </CardHeader>
        <CardContent>
          {activeRequests.length === 0 ? (
            <p className="text-muted-foreground">
              Henüz aktif bir kan bağışı isteğiniz bulunmuyor.
            </p>
          ) : (
            <div className="space-y-4">
              {activeRequests.map((request) => (
                <div
                  key={request._id.toString()}
                  className="flex flex-col space-y-2 p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {request.hospital} - {request.city}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.createdAt), "d MMMM yyyy", {
                          locale: tr,
                        })}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {request.bloodType}
                    </span>
                  </div>
                  <p className="text-sm">{request.description}</p>
                  <div className="text-sm text-muted-foreground">
                    <p>İhtiyaç: {request.units} ünite</p>
                    <p>İletişim: {request.contact}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geçmiş İstekler</CardTitle>
        </CardHeader>
        <CardContent>
          {completedRequests.length === 0 ? (
            <p className="text-muted-foreground">
              Henüz tamamlanmış bir kan bağışı isteğiniz bulunmuyor.
            </p>
          ) : (
            <div className="space-y-4">
              {completedRequests.map((request) => (
                <div
                  key={request._id.toString()}
                  className="flex flex-col space-y-2 p-4 border rounded-lg opacity-60"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {request.hospital} - {request.city}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.createdAt), "d MMMM yyyy", {
                          locale: tr,
                        })}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {request.bloodType}
                    </span>
                  </div>
                  <p className="text-sm">{request.description}</p>
                  <div className="text-sm text-muted-foreground">
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
  )
} 