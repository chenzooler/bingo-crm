// Skip static prerendering — all pages depend on runtime mock data
// and client components that don't need to be pre-built.
export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TasksPanel } from "@/components/layout/TasksPanel";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcuts";
import { OnboardingTour } from "@/components/ui/OnboardingTour";
import { HelpButton } from "@/components/ui/HelpButton";
import { PWARegister } from "@/components/ui/PWARegister";
import { AIAssistant, AIAssistantLauncher } from "@/components/ui/AIAssistant";
import { QuickAddLead } from "@/components/ui/QuickAddLead";
import { InstallPrompt } from "@/components/ui/InstallPrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <KeyboardShortcutsModal />
        <OnboardingTour />
        <div className="min-h-screen bg-bingo-cream">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-w-0 p-4 sm:p-6">
              <div className="page-transition">{children}</div>
            </main>
            <div className="hidden xl:block">
              <TasksPanel />
            </div>
          </div>
          <MobileBottomNav />
          <HelpButton />
          <AIAssistant />
          <AIAssistantLauncher />
          <QuickAddLead />
          <InstallPrompt />
          <PWARegister />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
