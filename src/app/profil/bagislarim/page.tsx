import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DonationHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Bağış Geçmişim</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tamamlanan Bağışlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">Henüz tamamlanmış bir bağışınız bulunmuyor.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İstatistikler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Bağış Sayısı</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Bağış Tarihi</p>
              <p className="text-base">Henüz bağış yapılmadı</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 