import { getServerSession } from "next-auth"
import { User, Mail, Phone, MapPin, Droplet, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/giris')
  }

  return (
    <div className="space-y-8 p-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-2xl font-semibold mb-6">Kişisel Bilgiler</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
            <User className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad</p>
              <p className="font-medium">{session.user.name || "Belirtilmemiş"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
            <Mail className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">E-posta</p>
              <p className="font-medium">{session.user.email || "Belirtilmemiş"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
            <Phone className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
              <p className="font-medium">{session.user.phone || "Belirtilmemiş"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
            <MapPin className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Şehir</p>
              <p className="font-medium">{session.user.city || "Belirtilmemiş"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
            <Droplet className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kan Grubu</p>
              <p className="font-medium">{session.user.bloodType || "Belirtilmemiş"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
            <Calendar className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Son Bağış Tarihi</p>
              <p className="font-medium">{session.user.lastDonationDate ? new Date(session.user.lastDonationDate).toLocaleDateString('tr-TR') : "Henüz bağış yapılmadı"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-2xl font-semibold mb-6">Bağış İstatistikleri</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Bağış</p>
            <p className="text-3xl font-bold text-red-600">{session.user.totalDonations || 0}</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Yardım Edilen Kişi</p>
            <p className="text-3xl font-bold text-red-600">{session.user.helpedPeople || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 