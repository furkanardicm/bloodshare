"use client"

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
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
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<BloodRequest[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/blood-requests/history', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Geçmiş yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Geçerli veri formatı alınamadı');
        }
        
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
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [session, toast]);

  if (!session?.user) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p className="text-muted-foreground text-center">
              Geçmiş kayıtlarını görüntülemek için giriş yapmalısınız.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner centered size="lg" />;
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Geçmiş</h1>
        
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">
                Henüz geçmiş kaydınız bulunmuyor.
              </p>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{request.hospital} - {request.city}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.createdAt), 'd MMMM yyyy', { locale: tr })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
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
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 