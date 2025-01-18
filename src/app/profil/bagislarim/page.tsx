'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

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
  donationStatus?: string;
}

export default function MyDonationsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<BloodRequest[]>([]);

  useEffect(() => {
    async function fetchDonations() {
      try {
        const response = await fetch('/api/blood-requests/my-donations', {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Bağışlar yüklenirken bir hata oluştu');
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
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-2 py-1 rounded-md bg-background border border-border text-sm">
                      {donation.bloodType}
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-md border text-sm",
                      donation.donationStatus === "pending" && "text-yellow-500 border-yellow-500",
                      donation.donationStatus === "completed" && "text-emerald-500 border-emerald-500",
                      donation.donationStatus === "cancelled" && "text-red-500 border-red-500"
                    )}>
                      {donation.donationStatus === "pending" && "Bekliyor"}
                      {donation.donationStatus === "completed" && "Tamamlandı"}
                      {donation.donationStatus === "cancelled" && "İptal Edildi"}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 