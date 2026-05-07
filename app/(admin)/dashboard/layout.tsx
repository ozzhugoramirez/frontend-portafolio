import React from 'react';
import Sidebar from '@/components/bashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full bg-[#050506] text-gray-400 font-sans flex flex-col md:flex-row overflow-hidden relative">

      <Sidebar />


      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-[#050506]">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

    </div>
  );
}