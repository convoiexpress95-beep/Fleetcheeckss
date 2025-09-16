import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Missions from "./pages/Missions";
import MissionDetail from "./pages/MissionDetail";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {import.meta.env.DEV && (
          <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,background:'#a855f7',color:'#fff',fontSize:12,padding:'4px 8px',textAlign:'center',letterSpacing:'.5px'}}>
            CLEAR-TRIP MICRO-APP (BUNDLE ISOLÉ)
          </div>
        )}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/missions/:id" element={<MissionDetail />} />
          {/* Redirections compat pour appels venant de l'app principale avec préfixe /cleartrip */}
          <Route path="/cleartrip" element={<Navigate to="/" replace />} />
          <Route path="/cleartrip/missions" element={<Navigate to="/missions" replace />} />
          <Route path="/cleartrip/missions/:id" element={<Navigate to="/missions/:id" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
