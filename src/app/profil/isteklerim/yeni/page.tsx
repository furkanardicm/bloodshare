"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    hospital: '',
    city: '',
    units: '',
    description: '',
    contact: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Bir hata oluştu');
      }

      toast.success('İlan başarıyla oluşturuldu');
      router.push('/profil/isteklerim');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Kan Bağışı İsteği</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Kan Grubu</Label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Kan Grubu Seçin</option>
                  <option value="A+">A RH+</option>
                  <option value="A-">A RH-</option>
                  <option value="B+">B RH+</option>
                  <option value="B-">B RH-</option>
                  <option value="AB+">AB RH+</option>
                  <option value="AB-">AB RH-</option>
                  <option value="0+">0 RH+</option>
                  <option value="0-">0 RH-</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Şehir</Label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Şehir Seçin</option>
                  <option value="İstanbul">İstanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="İzmir">İzmir</option>
                  <option value="Bursa">Bursa</option>
                  <option value="Antalya">Antalya</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hastane</Label>
              <Input
                id="hospital"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                placeholder="Hastane adı"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">İhtiyaç Duyulan Ünite</Label>
              <Input
                id="units"
                name="units"
                type="number"
                min="1"
                value={formData.units}
                onChange={handleChange}
                placeholder="Ünite sayısı"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="İhtiyaç detayları"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">İletişim Bilgileri</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Telefon numarası"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              <Heart className="w-4 h-4 mr-2" />
              {loading ? 'İlan Oluşturuluyor...' : 'İsteği Oluştur'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 