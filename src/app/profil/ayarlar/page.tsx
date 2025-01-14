'use client';

import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <SettingsForm />
      </div>
    </div>
  );
} 