'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Donor {
  userId: string;
  status: string;
  user: {
    name: string;
    bloodType: string;
    city: string;
    phone: string;
  };
}

interface BloodRequest {
  _id: string;
  bloodType: string;
  hospital: string;
  city: string;
  units: string;
  status: string;
  donors: Donor[];
  createdAt: string;
}

export default function DonorsPage({ params }: { params: { requestId: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<BloodRequest | null>(null);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const response = await fetch(`/api/blood-requests/${params.requestId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('İstek yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        setRequest(data);
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
      fetchRequest();
    }
  }, [session, params.requestId, toast]);

  const handleApproveDonor = async (donorId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${params.requestId}/donors/${donorId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Bağışçı onaylanırken bir hata oluştu');
      }
      
      setRequest(data);

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

  const handleRejectDonor = async (donorId: string) => {
    try {
      const response = await fetch(`/api/blood-requests/${params.requestId}/donors/${donorId}/reject`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Bağışçı reddedilirken bir hata oluştu');
      }
      
      setRequest(data);

      toast({
        title: "Başarılı!",
        description: "Bağışçı reddedildi.",
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

  if (!request) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/profil/isteklerim">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Bağışçılar</h1>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            Bağış isteği bulunamadı.
          </p>
        </Card>
      </div>
    );
  }

  const allDonorsApproved = request.donors.every(donor => donor.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/profil/isteklerim">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bağışçılar</h1>
          <p className="text-sm text-muted-foreground">
            {request.hospital} - {request.city} ({request.bloodType})
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {request.donors.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-center">
              Henüz bağışçı bulunmuyor.
            </p>
          </Card>
        ) : allDonorsApproved ? (
          <Card className="p-6">
            <p className="text-emerald-500 text-center">
              Tüm bağışçılar onaylandı.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {request.donors.map((donor) => (
              <Card key={donor.userId} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{donor.user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {donor.user.city} • {donor.user.bloodType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tel: {donor.user.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {donor.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-500 border-emerald-500 hover:bg-emerald-500 hover:text-white"
                          onClick={() => handleApproveDonor(donor.userId)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Onayla
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => handleRejectDonor(donor.userId)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reddet
                        </Button>
                      </>
                    )}
                    {donor.status === "approved" && (
                      <div className="px-2 py-1 rounded-md text-emerald-500 border border-emerald-500 text-sm">
                        Onaylandı
                      </div>
                    )}
                    {donor.status === "rejected" && (
                      <div className="px-2 py-1 rounded-md text-red-500 border border-red-500 text-sm">
                        Reddedildi
                      </div>
                    )}
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