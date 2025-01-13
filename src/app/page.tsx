'use client';

import React from 'react';
import { Heart, Building2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/LoginModal';

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
      image: "/slider1.jpg"
    },
    {
      title: "Acil Kan İhtiyacı",
      subtitle: "Her Saniye Önemli",
      desc: "Acil durumlarda hızlı eşleşme sistemi ile dakikalar içinde bağışçı bulun.",
      image: "/slider2.jpg"
    },
    {
      title: "Güvenilir Platform",
      subtitle: "Hastanelerle Entegre",
      desc: "Türkiye'nin önde gelen hastaneleriyle işbirliği içinde çalışıyoruz.",
      image: "/slider3.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Slider */}
      <div className="relative h-[600px] w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="relative z-20 h-full flex items-center justify-center">
              <div className="text-center max-w-4xl mx-auto px-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                  <span className="text-white">
                    {slide.title}
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 block mt-2">
                    {slide.subtitle}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  {slide.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-red-500 w-8' 
                  : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
        
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto -mt-20 relative z-30 px-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => {
              if (session) {
                router.push('/profil/isteklerim/yeni');
              } else {
                setShowLoginModal(true);
              }
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg transition-all duration-300 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-black flex items-center justify-center space-x-2"
          >
            <Heart className="w-5 h-5" />
            <span>Kan Bağışında Bulun</span>
          </button>
          <Link href="/bagiscilar" className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 border-2 border-red-500 text-red-500 dark:text-red-400 px-8 py-3 rounded-lg transition-all duration-300 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-black flex items-center justify-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Bağışçı Arayın</span>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 mt-24 px-4">
        {[
          { icon: Heart, title: 'Hızlı Eşleşme', desc: 'Kan grubu ve konum bazlı akıllı eşleştirme sistemi ile hızlıca bağışçı bulun.' },
          { icon: Building2, title: 'Hastane Entegrasyonu', desc: 'Hastanelerle entegre sistem sayesinde ihtiyaçları anlık olarak takip edin.' },
          { icon: Users, title: 'Mobil Uyumlu', desc: 'Her cihazda sorunsuz çalışan modern arayüz ile her an ulaşılabilir.' }
        ].map((feature, i) => (
          <div key={i} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 dark:from-red-500/10 dark:to-red-600/10 rounded-xl transition-all duration-300"></div>
            <div className="bg-white dark:bg-black p-8 rounded-xl relative">
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-500/10 dark:to-red-600/5 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                {React.createElement(feature.icon, { className: "w-6 h-6 text-red-500 dark:text-red-400" })}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="relative group max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 dark:from-red-500/10 dark:to-red-600/10 rounded-xl transition-all duration-300"></div>
        <div className="bg-white dark:bg-black rounded-xl p-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Heart, value: '1,234+', label: 'Başarılı Bağış' },
              { icon: Building2, value: '56', label: 'Partner Hastane' },
              { icon: Users, value: '789+', label: 'Aktif Bağışçı' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-500/10 dark:to-red-600/5 p-3 rounded-full">
                  {React.createElement(stat.icon, { className: "w-8 h-8 text-red-500 dark:text-red-400" })}
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal 
        show={showLoginModal} 
        handleClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
} 