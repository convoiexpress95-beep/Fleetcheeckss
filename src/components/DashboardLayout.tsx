import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { NotificationBell } from "@/components/NotificationBell";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard, Car, ShoppingCart } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const IS_DEV = !!import.meta.env.DEV;
  // URLs externes Lovable (ouvrent dans un nouvel onglet si configurées)
  const USE_EXTERNAL_MARKET = String(import.meta.env.VITE_USE_EXTERNAL_LOVABLE || '').toLowerCase() === 'true';
  const MARKET_HASH = String(import.meta.env.VITE_MARKET_HASH_PATH || '#/');
  const marketHashNorm = MARKET_HASH ? (MARKET_HASH.startsWith('#') ? MARKET_HASH : `#${MARKET_HASH}`) : '#/';
  const MARKET_URL = (!IS_DEV && USE_EXTERNAL_MARKET && import.meta.env.VITE_LOVABLE_URL)
    ? `${String(import.meta.env.VITE_LOVABLE_URL)}${marketHashNorm}`
    // Fallback vers l’embed local toujours disponible
    : `/embeds/market/index.html${marketHashNorm}`;

  const USE_EXTERNAL_CONV = String(import.meta.env.VITE_USE_EXTERNAL_CONVOITURAGE || '').toLowerCase() === 'true';
  const CONV_HASH = String(import.meta.env.VITE_CONVOITURAGE_HASH_PATH || '#/');
  const convHashNorm = CONV_HASH ? (CONV_HASH.startsWith('#') ? CONV_HASH : `#${CONV_HASH}`) : '#/';
  const CONV_URL = (!IS_DEV && USE_EXTERNAL_CONV && import.meta.env.VITE_CONVOITURAGE_URL)
    ? `${String(import.meta.env.VITE_CONVOITURAGE_URL)}${convHashNorm}`
    : `/embeds/convoiturage/index.html${convHashNorm}`;

  return (
    <SidebarProvider>
  <div className="min-h-screen flex w-full bg-black text-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header avec trigger de sidebar */}
          <header className="h-14 border-b border-gray-800 flex items-center px-4 bg-black/85 backdrop-blur supports-[backdrop-filter]:bg-black/70 relative">
            <SidebarTrigger className="mr-4" />
            {/* Zone centrée */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <div className="flex items-center gap-3 px-0 py-0 bg-transparent shadow-none">
                {/* Icône Facturation */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/billing"
                      aria-label="Facturation"
                      title="Facturation"
                      className={`group inline-flex h-11 items-center gap-2 rounded-full px-2 outline-none focus-visible:outline-none focus-visible:ring-0 bg-transparent transition-transform duration-300 hover:scale-105 active:scale-95 ${
                        location.pathname.startsWith('/billing')
                          ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.45)]'
                          : 'text-emerald-300/80 hover:text-emerald-300 hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.45)]'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
                      <span className="text-sm font-semibold tracking-wide hidden sm:inline">Facturation</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-emerald-900/90 text-emerald-50 border-emerald-500/30">
                    💳 Gérez vos abonnements et factures
                  </TooltipContent>
                </Tooltip>

                {/* Icône Convoiturage */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/convoiturage"
                      aria-label="Convoiturage"
                      title="Convoiturage"
                      className={`group inline-flex h-11 items-center gap-2 rounded-full px-2 outline-none focus-visible:outline-none focus-visible:ring-0 bg-transparent transition-transform duration-300 hover:scale-105 active:scale-95 ${
                        location.pathname.startsWith('/convoiturage')
                          ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.45)]'
                          : 'text-blue-300/80 hover:text-blue-300 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.45)]'
                      }`}
                    >
                      <Car className="w-6 h-6 transition-transform duration-300 group-hover:-rotate-6" />
                      <span className="text-sm font-semibold tracking-wide hidden sm:inline">Convoiturage</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-blue-900/90 text-blue-50 border-blue-500/30">
                    🚗 Publiez ou gérez vos trajets
                  </TooltipContent>
                </Tooltip>

                {/* Icône FleetMarket */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/marketplace"
                      aria-label="FleetMarket"
                      title="FleetMarket"
                      className={`group inline-flex h-11 items-center gap-2 rounded-full px-2 outline-none focus-visible:outline-none focus-visible:ring-0 bg-transparent transition-transform duration-300 hover:scale-105 active:scale-95 ${
                        location.pathname.startsWith('/marketplace')
                          ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.45)]'
                          : 'text-purple-300/80 hover:text-purple-300 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.45)]'
                      }`}
                    >
                      <ShoppingCart className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
                      <span className="text-sm font-semibold tracking-wide hidden sm:inline">FleetMarket</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-purple-900/90 text-purple-50 border-purple-500/30">
                    🛒 Achetez des services et options
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              <CreditsDisplay />
            </div>
          </header>
          
          {/* Contenu principal */}
          <main className="flex-1 overflow-auto bg-black">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}