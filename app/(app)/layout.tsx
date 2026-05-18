import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TasksPanel } from "@/components/layout/TasksPanel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bingo-cream">
      <Header />
      <div className="flex">
        <Suspense fallback={<div className="w-72" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
        <div className="hidden xl:block">
          <TasksPanel />
        </div>
      </div>
    </div>
  );
}
