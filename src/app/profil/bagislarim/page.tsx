'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { BloodRequest } from "@/types/user";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { cn } from "@/lib/utils";

export default function DonationsPage() {
  const [donations, setDonations] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/giris');
    }
  }, [status]);

  useEffect(() => {
    async function fetchDonations() {
      try {
        const response = await fetch('/api/blood-requests/my-donations', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Bağışlar yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        setDonations(data);
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
      fetchDonations();
    }
  }, [session, toast]);

  const handleCompleteDonation = async (requestId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/complete-donation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bağış tamamlanırken bir hata oluştu');
      }
      
      const updatedRequest = await response.json();
      setDonations(prev => prev.map(donation => 
        donation._id === requestId ? updatedRequest : donation
      ));

      toast({
        title: "Başarılı!",
        description: "Bağışınız tamamlandı olarak işaretlendi.",
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
      <h1 className="text-2xl font-semibold tracking-tight">Bağışlarım</h1>
      
      <div className="space-y-4">
        {donations.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-center">
              Henüz bir bağışta bulunmamışsınız.
            </p>
          </Card>
        ) : (
          donations.map((donation) => (
            <Card key={donation._id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{donation.hospital} - {donation.city}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(donation.createdAt), 'd MMMM yyyy', { locale: tr })}
                  </p>
                  <p className="text-sm text-red-500 font-medium mt-1">
                    {donation.isUrgent && 'ACİL KAN İHTİYACI!'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-2 py-1 rounded-md bg-background border border-border text-sm">
                      {donation.bloodType}
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-md border text-sm",
                      donation.status === "pending" && "text-yellow-500 border-yellow-500",
                      donation.status === "completed" && "text-emerald-500 border-emerald-500",
                      donation.status === "cancelled" && "text-red-500 border-red-500"
                    )}>
                      {donation.status === "pending" && "Bekliyor"}
                      {donation.status === "completed" && "Tamamlandı"}
                      {donation.status === "cancelled" && "İptal Edildi"}
                    </div>
                  </div>
                </div>

                {donation.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompleteDonation(donation._id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bağışı Tamamla
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 