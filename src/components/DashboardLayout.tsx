import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { NotificationBell } from "@/components/NotificationBell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header avec trigger de sidebar */}
          <header className="h-14 border-b border-border/40 flex items-center px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="mr-4" />
            {/* Marque texte-only */}
            <div className="flex-1 select-none">
              <span
                className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #00ffff 0%, #00c8ff 100%)",
                }}
              >
                FleetChecks
              </span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <CreditsDisplay />
            </div>
          </header>
          
          {/* Contenu principal */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}