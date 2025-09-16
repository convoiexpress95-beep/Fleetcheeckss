import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Missions from '@/pages/Missions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/hooks/useAuth';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/*" element={<Missions />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
