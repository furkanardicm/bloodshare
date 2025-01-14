'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import type { BloodRequest } from "@/types/user";

export function DonationHistory() {
  const [history, setHistory] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
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

        // Tüm kayıtları birleştir ve tarihe göre sırala
        const allHistory = [...donations, ...requests]
          .filter(item => item.status === 'completed')
          .sort((a, b) => 
            new Date(b.completedAt || b.createdAt).getTime() - 
            new Date(a.completedAt || a.createdAt).getTime()
          );

        setHistory(allHistory);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bağış Geçmişim</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground">Henüz tamamlanmış bir bağış kaydınız bulunmuyor.</p>
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