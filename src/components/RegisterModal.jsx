"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PasswordInput } from "@/components/ui/password-input";
import { CITIES } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";

export default function RegisterModal({ show, handleClose }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          isDonor: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kayıt başarısız");
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error || "Giriş yapılamadı");
      }

      toast({
        title: "Başarılı!",
        description: "Hesabınız oluşturuldu ve giriş yapıldı.",
      });

      handleClose();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kayıt Ol</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              {...register("name", { required: "Ad Soyad zorunludur" })}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "E-posta zorunludur",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Geçerli bir e-posta adresi giriniz",
                },
              })}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              {...register("password", {
                required: "Şifre zorunludur",
                minLength: {
                  value: 8,
                  message: "Şifre en az 8 karakter olmalıdır",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone", { required: "Telefon numarası zorunludur" })}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Şehir</Label>
            <select
              id="city"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("city", { required: "Şehir seçimi zorunludur" })}
              disabled={loading}
            >
              <option value="">Şehir Seçin</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodType">Kan Grubu</Label>
            <div className="flex items-center justify-between gap-4">
              <select
                id="bloodType"
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("bloodType", { required: "Kan grubu zorunludur" })}
                disabled={loading}
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
              <div className="flex items-center gap-2">
                <Label htmlFor="isDonor">Bağışçı Olmak İstiyorum</Label>
                <Switch
                  id="isDonor"
                  name="isDonor"
                  defaultChecked={true}
                  disabled={loading}
                  {...register("isDonor")}
                />
              </div>
            </div>
            {errors.bloodType && (
              <p className="text-sm text-red-500">{errors.bloodType.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 