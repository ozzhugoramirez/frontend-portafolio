import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AdminBaseLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f5f7] text-gray-900 font-sans selection:bg-blue-500/30">
      {children}
    </div>
  );
}