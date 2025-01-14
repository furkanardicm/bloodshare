'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Heart, ListTodo, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Stats {
  totalRequests: number
  activeRequests: number
  completedRequests: number
  totalDonations: number
  pendingDonations: number
  completedDonations: number
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const [requestsResponse, donationsResponse] = await Promise.all([
          fetch('/api/blood-requests/my-requests'),
          fetch('/api/blood-requests/my-donations')
        ]);

        if (!requestsResponse.ok || !donationsResponse.ok) {
          throw new Error('İstatistikler yüklenirken bir hata oluştu');
        }

        const requests = await requestsResponse.json();
        const donations = await donationsResponse.json();

        setStats({
          totalRequests: requests.length,
          activeRequests: requests.filter((r: any) => r.status === 'active').length,
          completedRequests: requests.filter((r: any) => r.status === 'completed').length,
          totalDonations: donations.length,
          pendingDonations: donations.filter((d: any) => d.status === 'pending').length,
          completedDonations: donations.filter((d: any) => d.status === 'completed').length
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Bir hata oluştu';
        setError(message);
        toast({
          variant: "destructive",
          title: "Hata!",
          description: message
        });
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchStats();
    }
  }, [session, toast]);

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          İstatistik bulunamadı.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container max-w-full py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profilim</h1>
        <Link href="/profil/isteklerim/yeni">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni İstek Oluştur
          </Button>
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Hoş Geldin, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Kan bağışı istatistiklerinizi ve aktivitelerinizi buradan takip edebilirsiniz.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Bağış
            </CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                <span>Tamamlanan: {stats.completedDonations}</span>
              </div>
              <div>•</div>
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3 text-yellow-500" />
                <span>Bekleyen: {stats.pendingDonations}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam İstek
            </CardTitle>
            <ListTodo className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3 text-yellow-500" />
                <span>Aktif: {stats.activeRequests}</span>
              </div>
              <div>•</div>
              <div className="flex items-center">
                <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                <span>Tamamlanan: {stats.completedRequests}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 