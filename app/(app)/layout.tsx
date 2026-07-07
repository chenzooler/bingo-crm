// Skip static prerendering — all pages depend on runtime data
// and client components that don't need to be pre-built.
export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { NavRail } from "@/components/layout/NavRail";
import { TasksPanel } from "@/components/layout/TasksPanel";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcuts";
import { PWARegister } from "@/components/ui/PWARegister";
import { QuickAddLead } from "@/components/ui/QuickAddLead";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <KeyboardShortcutsModal />
        <div className="min-h-screen bg-bingo-cream">
          <Header />
          <div className="flex">
            <NavRail />
            <main className="flex-1 min-w-0 p-4 sm:p-6">
              <div className="page-transition">{children}</div>
            </main>
            <div className="hidden xl:block">
              <TasksPanel />
            </div>
          </div>
          <MobileBottomNav />
          {/* שכפול יועצים: עוזר ה-AI (תוספת בינגו) מוסתר עד שלב הפיצ'רים —
              להחזרה: ייבוא AIAssistant + AIAssistantLauncher מ-components/ui/AIAssistant */}
          <QuickAddLead />
          <PWARegister />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
