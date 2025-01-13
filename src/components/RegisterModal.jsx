import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function RegisterModal({ show, handleClose }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodType: '',
    city: '',
    phone: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];
  const cities = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
    'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
    'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
    'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
    'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
    'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
    'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
    'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye',
    'Düzce'
  ].sort();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Şifreler eşleşmiyor.",
      });
      return;
    }

    // Telefon numarası kontrolü
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Geçerli bir telefon numarası giriniz (10 haneli).",
      });
      return;
    }

    // Kan grubu kontrolü
    if (!formData.bloodType) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Lütfen kan grubunuzu seçin.",
      });
      return;
    }

    // Şehir kontrolü
    if (!formData.city) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Lütfen şehrinizi seçin.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Form state:', formData);
      console.log('Select values:', {
        bloodType: formData.bloodType,
        city: formData.city
      });

      const formDataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        bloodType: formData.bloodType,
        city: formData.city,
        phone: formData.phone
      };

      console.log('Gönderilecek form verileri:', formDataToSend);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();
      console.log('API yanıtı:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Kayıt olurken bir hata oluştu');
      }

      toast({
        title: "Başarılı!",
        description: "Kayıt işlemi başarıyla tamamlandı. Giriş yapılıyor...",
      });

      // Biraz bekle ve sonra giriş yap
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Kayıt başarılı olduktan sonra otomatik giriş yap
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Başarılı girişten sonra ana sayfaya yönlendir
      window.location.href = '/';
      handleClose();
      
    } catch (error) {
      console.error('Kayıt/Giriş hatası:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Kayıt Ol</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ad Soyad</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Adınızı ve soyadınızı giriniz"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="E-posta adresinizi giriniz"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bloodType" className="text-gray-700 dark:text-gray-300">Kan Grubu</Label>
              <Select
                name="bloodType"
                value={formData.bloodType}
                onValueChange={(value) => handleSelectChange('bloodType', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kan grubunuzu seçin" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">Şehir</Label>
              <Select
                name="city"
                value={formData.city}
                onValueChange={(value) => handleSelectChange('city', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Şehrinizi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="5XX XXX XX XX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Şifrenizi giriniz"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Şifrenizi tekrar giriniz"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
              className="border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              Kapat
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterModal; 