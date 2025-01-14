"use client"

import { DonationHistory } from "@/components/donation-history"

export default function HistoryPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Geçmiş</h1>
        <DonationHistory />
      </div>
    </div>
  );
} 