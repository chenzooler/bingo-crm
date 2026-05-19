import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TasksPanel } from "@/components/layout/TasksPanel";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <KeyboardShortcutsModal />
        <div className="min-h-screen bg-bingo-cream">
          <Header />
          <div className="flex">
            <Suspense fallback={<div className="w-72" />}>
              <Sidebar />
            </Suspense>
            <main className="flex-1 min-w-0 p-4 sm:p-6">
              <div className="page-transition">{children}</div>
            </main>
            <div className="hidden xl:block">
              <TasksPanel />
            </div>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
