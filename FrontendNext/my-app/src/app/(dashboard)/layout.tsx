"use client";

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SalesWatcher } from '@/components/layout/SalesWatcher';
import { AdminChatWidget } from '@/components/AdminChatWidget';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="hidden lg:block w-64 shrink-0 print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <Header />
        </div>
        <SalesWatcher />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <AdminChatWidget />
    </div>
  );
}