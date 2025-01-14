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

export default function LoginModal({ show, handleClose, setShowRegisterModal }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Başarılı!",
        description: "Giriş yapıldı.",
        className: "bg-red-600 text-white border-none"
      });

      handleClose();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Giriş yapılamadı",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giriş Yap</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
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
              autoComplete="current-password"
              disabled={loading}
              {...register("password", {
                required: "Şifre zorunludur",
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <button
              type="button"
              onClick={() => {
                handleClose();
                setShowRegisterModal(true);
              }}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Kayıt Ol
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 