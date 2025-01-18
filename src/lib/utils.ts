import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sabit renk listesi
export const AVATAR_COLORS = [
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
export function getAvatarColor(userId: string): { bg: string; text: string } {
  const sum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
