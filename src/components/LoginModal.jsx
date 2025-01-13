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

function LoginModal({ show, handleClose }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        throw new Error(result.error || 'Giriş yapılırken bir hata oluştu');
      }

      toast({
        title: "Başarılı!",
        description: "Giriş başarıyla yapıldı.",
      });

      handleClose();
      
    } catch (error) {
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
          <DialogTitle className="text-gray-900 dark:text-white">Giriş Yap</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal; 