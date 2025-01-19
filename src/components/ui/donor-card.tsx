'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DonorCardProps {
  donor: {
    _id: string;
    name: string;
    bloodType: string;
    city: string;
    image?: string;
  };
}

// Sabit renk listesi
const AVATAR_COLORS = [
  { bg: 'from-red-400 to-red-600', text: 'text-white' },
  { bg: 'from-green-400 to-green-600', text: 'text-white' },
  { bg: 'from-blue-400 to-blue-600', text: 'text-white' },
  { bg: 'from-yellow-400 to-yellow-600', text: 'text-black' },
  { bg: 'from-purple-400 to-purple-600', text: 'text-white' },
  { bg: 'from-pink-400 to-pink-600', text: 'text-white' },
  { bg: 'from-indigo-400 to-indigo-600', text: 'text-white' },
  { bg: 'from-orange-400 to-orange-600', text: 'text-white' },
  { bg: 'from-teal-400 to-teal-600', text: 'text-white' },
  { bg: 'from-cyan-400 to-cyan-600', text: 'text-white' },
];

// Kullanıcı ID'sine göre sabit renk seçen fonksiyon
function getAvatarColor(userId: string): { bg: string; text: string } {
  const sum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function DonorCard({ donor }: DonorCardProps) {
  return (
    <Link 
      href={`/profil/${donor._id}`}
      className="block hover:opacity-90 transition-opacity"
    >
      <Card className="border dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800 shadow-inner">
              <AvatarImage src={donor.image} />
              <AvatarFallback 
                className={`text-lg bg-gradient-to-br ${getAvatarColor(donor._id).bg} ${getAvatarColor(donor._id).text} shadow-inner`}
              >
                {donor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{donor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {donor.bloodType} Kan Grubu • {donor.city}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
} 