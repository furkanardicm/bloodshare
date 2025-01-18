'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Users, CheckCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BloodRequest {
  _id: string;
  userId: string;
  bloodType: string;
  hospital: string;
  city: string;
  units: string;
  description: string;
  contact: string;
  status: string;
  donors: Array<{
    userId: string;
    status: string;
  }>;
  totalDonors: number;
  createdAt: string;
  updatedAt: string;
  isUrgent?: boolean;
}

export default function MyRequestsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<BloodRequest[]>([]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/blood-requests/my-requests', {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('İstekler yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        setRequests(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error instanceof Error ? error.message : 'Bir hata oluştu'
        });
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchRequests();
    }
  }, [session, toast]);

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/complete`, {
        method: 'POST'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'İstek tamamlanırken bir hata oluştu')
      }
      
      setRequests(prev => prev.map(request => 
        request._id === requestId ? data : request
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

  const handleCancel = async (requestId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'İstek iptal edilirken bir hata oluştu')
      }

      setRequests(prev => prev.map(request => 
        request._id === requestId 
          ? { ...request, status: 'cancelled' as const } 
          : request
      ))

      toast({
        title: "Başarılı!",
        description: "Bağış isteği iptal edildi.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Bir hata oluştu'
      })
    }
  }

  const handleApproveDonor = async (requestId: string, donorId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/donors/${donorId}/approve`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Bağışçı onaylanırken bir hata oluştu');
      }
      
      setRequests(prev => prev.map(request => 
        request._id === requestId ? data : request
      ));

      toast({
        title: "Başarılı!",
        description: "Bağışçı onaylandı.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Bir hata oluştu'
      });
    }
  };

  if (loading) {
    return <LoadingSpinner centered size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">İsteklerim</h1>
        <Link href="/profil/isteklerim/yeni">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni İstek Oluştur
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-center">
              Henüz bir bağış isteğiniz bulunmuyor.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request._id} className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{request.hospital} - {request.city}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.createdAt), 'd MMMM yyyy', { locale: tr })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        İhtiyaç: {request.units} ünite
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 rounded-md bg-background border border-border text-sm">
                        {request.bloodType}
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-md border text-sm",
                        request.status === "pending" && "text-yellow-500 border-yellow-500",
                        request.status === "completed" && "text-emerald-500 border-emerald-500",
                        request.status === "cancelled" && "text-red-500 border-red-500"
                      )}>
                        {request.status === "pending" && "Bekliyor"}
                        {request.status === "completed" && "Tamamlandı"}
                        {request.status === "cancelled" && "İptal Edildi"}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Bağışçılar</span>
                        <div className="px-2 py-1 rounded-md bg-background border border-border text-sm ml-2">
                          {request.donors?.length || 0}/{request.units}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/profil/isteklerim/${request._id}/bagiscilar`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white border-none"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Bağışçıları Görüntüle
                          </Button>
                        </Link>
                        {request.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleCancel(request._id)}
                          >
                            İptal Et
                          </Button>
                        )}
                        {request.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-500 border-emerald-500"
                            disabled
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Tamamlandı
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 