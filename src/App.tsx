import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MobileLayout } from "@/components/MobileLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import NewMission from "./pages/NewMission";
import EditMission from "./pages/EditMission";
import Contacts from "./pages/Contacts";
import Tracking from "./pages/Tracking";
import PublicTracking from "./pages/PublicTracking";
import Reports from "./pages/Reports";
import Billing from "./pages/Billing";
import Shop from "./pages/Shop";
import Marketplace from "./pages/Marketplace";
import PostMarketplaceMission from "./pages/PostMarketplaceMission";
import AcceptedMarketplaceMissions from "./pages/AcceptedMarketplaceMissions";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";
import ConvoiturageHome from "./pages/convoiturage/Index";
import ConvoituragePublish from "./pages/convoiturage/PublishTrip";
import ConvoiturageTripDetails from "./pages/convoiturage/TripDetails";
import ConvoiturageMyTrips from "./pages/convoiturage/MyTrips";
import ConvoiturageMessages from "./pages/convoiturage/Messages";
import ConvoiturageProfile from "./pages/convoiturage/Profile";
import ConvoiturageLayout from "./pages/convoiturage/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <MobileLayout>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/public-tracking/:token" element={<PublicTracking />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/missions" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Missions />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/missions/new" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NewMission />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/missions/:id/edit" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditMission />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Contacts />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/tracking" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Tracking />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Billing />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/convoiturage" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ConvoiturageLayout>
                    <ConvoiturageHome />
                  </ConvoiturageLayout>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/convoiturage/publish" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ConvoiturageLayout>
                    <ConvoituragePublish />
                  </ConvoiturageLayout>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/convoiturage/trips/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ConvoiturageLayout>
                    <ConvoiturageTripDetails />
                  </ConvoiturageLayout>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/convoiturage/my-trips" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ConvoiturageLayout>
                    <ConvoiturageMyTrips />
                  </ConvoiturageLayout>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/convoiturage/messages" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ConvoiturageLayout>
                    <ConvoiturageMessages />
                  </ConvoiturageLayout>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/convoiturage/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ConvoiturageLayout>
                    <ConvoiturageProfile />
                  </ConvoiturageLayout>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/shop" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Shop />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Marketplace />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/marketplace/post" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PostMarketplaceMission />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/marketplace/accepted" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AcceptedMarketplaceMissions />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Admin />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/catalog" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Catalog />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </MobileLayout>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
