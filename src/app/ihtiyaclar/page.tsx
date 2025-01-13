"use client"

import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Phone, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface BloodRequest {
  _id: string;
  userId: {
    name: string;
  };
  bloodType: string;
  hospital: string;
  city: string;
  units: number;
  description: string;
  contact: string;
  createdAt: string;
  status: 'active' | 'completed';
}

function maskName(name: string): string {
  if (!name) return 'İsimsiz';
  const parts = name.split(' ');
  const maskedParts = parts.map(part => {
    if (part.length <= 1) return part;
    return part[0] + '*'.repeat(part.length - 1);
  });
  return maskedParts.join(' ');
}

export default function NeedsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodType, setBloodType] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'city'>('newest');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const response = await fetch('/api/blood-requests/active');
      if (!response.ok) {
        throw new Error('Veriler alınamadı');
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Veri alma hatası:', error);
      toast({
        title: 'Hata',
        description: 'Kan ihtiyaçları yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBloodType = !bloodType || bloodType === 'all' || request.bloodType === bloodType;

    return matchesSearch && matchesBloodType;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'city':
        return a.city.localeCompare(b.city);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Kan İhtiyaçları
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aktif kan ihtiyaçlarını görüntüleyin ve filtreleme seçenekleriyle arama yapın.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Hastane, şehir veya açıklama ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger className="w-[180px] bg-transparent">
                  <SelectValue placeholder="Kan Grubu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="0+">0+</SelectItem>
                  <SelectItem value="0-">0-</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'city') => setSortBy(value)}>
                <SelectTrigger className="w-[180px] bg-transparent">
                  <SelectValue placeholder="Sıralama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">En Yeni</SelectItem>
                  <SelectItem value="oldest">En Eski</SelectItem>
                  <SelectItem value="city">Şehir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Yükleniyor...
            </p>
          </div>
        )}

        {/* Requests List */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedRequests.map((request) => (
              <Card key={request._id} className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      {request.hospital}
                    </CardTitle>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      {request.bloodType}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{request.city}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {request.description}
                    </p>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{maskName(request.userId?.name)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{request.contact}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {requests.length === 0 
                ? 'Şu anda aktif bir kan ihtiyacı bulunmuyor.'
                : 'Arama kriterlerinize uygun kan ihtiyacı bulunamadı.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 