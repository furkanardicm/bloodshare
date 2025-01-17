'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BloodRequest } from "@/types/user";

export function DonationHistory() {
  const [history, setHistory] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setError(null);
        const [donationsRes, requestsRes] = await Promise.all([
          fetch('/api/blood-requests/my-donations?status=completed'),
          fetch('/api/blood-requests/my-requests?status=completed')
        ]);

        if (!donationsRes.ok || !requestsRes.ok) 
          throw new Error('Geçmiş yüklenirken bir hata oluştu');

        const [donations, requests] = await Promise.all([
          donationsRes.json(),
          requestsRes.json()
        ]);

        console.log('Bağışlar:', donations);
        console.log('İstekler:', requests);

        // Tüm kayıtları birleştir ve tarihe göre sırala
        const allHistory = [...donations, ...requests]
          .filter(item => item.status === 'completed')
          .sort((a, b) => 
            new Date(b.completedAt || b.createdAt).getTime() - 
            new Date(a.completedAt || a.createdAt).getTime()
          );

        console.log('Birleştirilmiş geçmiş:', allHistory);
        setHistory(allHistory);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Bir hata oluştu';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bağış Geçmişim</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Henüz tamamlanmış bir bağış kaydınız bulunmuyor
            </p>
            <p className="text-sm text-muted-foreground">
              Tamamlanan bağışlarınız ve istekleriniz burada görüntülenecektir.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.hospital} - {item.city}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.completedAt || item.createdAt), "d MMMM yyyy", {
                        locale: tr,
                      })}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    {item.bloodType}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>{item.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span>Durum:</span>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Tamamlandı</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 