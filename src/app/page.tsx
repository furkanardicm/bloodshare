'use client';

import React from 'react';
import { Heart, Building2, Users, ChevronLeft, ChevronRight, Search, Droplets } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const slides = [
    {
      title: "Hayat Kurtarmak İçin",
      subtitle: "Bir Damla Kan Yeter",
      desc: "Kan bağışı platformumuz aracılığıyla ihtiyaç sahiplerine yardım edin, hayat kurtarın.",
      image: "/images/blooddonation_1.jpg"
    },
    {
      title: "Acil Kan İhtiyacı",
      subtitle: "Her Saniye Önemli",
      desc: "Acil durumlarda hızlı eşleşme sistemi ile dakikalar içinde bağışçı bulun.",
      image: "/images/blooddonation_1.jpg"
    },
    {
      title: "Güvenilir Platform",
      subtitle: "Hastanelerle Entegre",
      desc: "Türkiye'nin önde gelen hastaneleriyle işbirliği içinde çalışıyoruz.",
      image: "/images/blooddonation_1.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex-1">
      <div className="relative">
        {/* Slider */}
        <div className="relative h-[600px] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentSlide === index ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-4 max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-shadow-sm">
                    {slide.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Buttons */}
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  currentSlide === index
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute left-0 right-0 bottom-20 flex justify-center gap-4 z-10">
          <Link href="/profil/isteklerim/yeni">
            <Button className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg dark:text-white flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Droplets className="w-6 h-6" />
              <span>Kan Bağışında Bulun</span>
            </Button>
          </Link>
          <Link href="/bagiscilar">
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white px-8 py-6 text-lg flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Search className="w-6 h-6" />
              <span>Bağışçı Arayın</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-background">
        {/* Features Section */}
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 mt-24 px-4">
          {[
            { icon: Heart, title: 'Hızlı Eşleşme', desc: 'Kan grubu ve konum bazlı akıllı eşleştirme sistemi ile hızlıca bağışçı bulun.' },
            { icon: Building2, title: 'Hastane Entegrasyonu', desc: 'Hastanelerle entegre sistem sayesinde ihtiyaçları anlık olarak takip edin.' },
            { icon: Users, title: 'Mobil Uyumlu', desc: 'Her cihazda sorunsuz çalışan modern arayüz ile her an ulaşılabilir.' }
          ].map((feature, i) => (
            <div key={i} className="relative group">
              <div className="bg-card p-8 rounded-xl relative border border-border hover:border-red-500/20 transition-colors duration-300">
                <div className="bg-accent/50 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  {React.createElement(feature.icon, { className: "w-6 h-6 text-red-500 dark:text-red-400" })}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Stats Section */}
        <section className="relative group max-w-7xl mx-auto">
          <div className="bg-card rounded-xl p-8 relative border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Heart, value: '1,234+', label: 'Başarılı Bağış' },
                { icon: Building2, value: '56', label: 'Partner Hastane' },
                { icon: Users, value: '789+', label: 'Aktif Bağışçı' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <div className="bg-accent/50 p-3 rounded-full">
                    {React.createElement(stat.icon, { className: "w-8 h-8 text-red-500 dark:text-red-400" })}
                  </div>
                  <div className="text-4xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Login Modal */}
      <LoginModal 
        show={showLoginModal} 
        handleClose={() => setShowLoginModal(false)} 
      />
    </main>
  );
} 