import { ProfileSidebar } from '@/components/ProfileSidebar';
import Header from '@/components/layout/Header';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex mt-[73px]">
        <ProfileSidebar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
} 