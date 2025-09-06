import {
  Home,
  Truck,
  Plus,
  Users,
  User,
  MapPin,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronUp,
  Crown,
  Smartphone,
  ShoppingCart,
  Store,
  Route as RouteIcon,
  MessageCircle,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BRAND_NAME } from "@/lib/branding";

const mainItems = [
  { title: "Tableau de bord", url: "/dashboard", icon: Home },
  { title: "Missions", url: "/missions", icon: Truck },
  { title: "Nouvelle mission", url: "/missions/new", icon: Plus },
  { title: "Marketplace", url: "/marketplace", icon: Store },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Trajets partagés", url: "/trajets", icon: RouteIcon },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Suivi GPS", url: "/tracking", icon: MapPin },
  { title: "Rapports", url: "/reports", icon: FileText },
];

const businessItems = [
  { title: "Facturation", url: "/billing", icon: CreditCard },
  { title: "Boutique", url: "/shop", icon: ShoppingCart },
];

const mobileItems = [
  // Removed mobile demo items
];

const adminItems = [
  { title: "Administration", url: "/admin", icon: Crown },
];

const profileItems = [
  { title: "Paramètres", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const routeActive = (path: string) =>
    currentPath === path || currentPath.startsWith(path + "/");

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "relative bg-primary/10 text-primary font-semibold border border-primary/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,.06)]"
      : "hover:bg-muted/60 transition-all duration-200";

  return (
    <Sidebar className="glass-card border-border/20 backdrop-blur-md bg-background/60 supports-[backdrop-filter]:bg-background/20">
      <SidebarContent className="bg-transparent/50 backdrop-blur-sm">
        {/* Branding */}
        <div className="p-4 border-b border-border/20 bg-background/30 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            {(!state || state === 'expanded') ? (
              <div className="flex flex-col items-start leading-none">
                <span
                  className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #20e3b2 0%, #0ea5e9 100%)",
                  }}
                >
                  FleetChecks
                </span>
                <span className="mt-1 text-xs text-muted-foreground">Plateforme</span>
              </div>
            ) : (
              <span
                className="text-lg font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #20e3b2 0%, #0ea5e9 100%)" }}
                aria-label="FleetChecks"
                title="FleetChecks"
              >
                FC
              </span>
            )}
            <SidebarTrigger className="ml-auto" />
          </div>
        </div>

        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls} end={!['/missions','/contacts','/reports','/marketplace','/messages','/trajets','/tracking'].includes(item.url)}>
                      <item.icon className="w-5 h-5" />
                      {!state || state === 'expanded' ? (
                        <span className="font-medium">{item.title}</span>
                      ) : null}
                      {/* Unread badge for Messages */}
                      {item.title === 'Messages' && unreadCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business & Facturation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-2">
            Business
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-5 h-5" />
                      {!state || state === 'expanded' ? (
                        <span className="font-medium">{item.title}</span>
                      ) : null}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration - Visible seulement pour les admins */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-2 flex items-center gap-2">
              <Crown className="w-3 h-3 text-yellow-500" />
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="w-5 h-5 text-yellow-500" />
                        {!state || state === 'expanded' ? (
                          <span className="font-medium">{item.title}</span>
                        ) : null}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Profil */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-2">
            Profil
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-5 h-5" />
                      {!state || state === 'expanded' ? (
                        <span className="font-medium">{item.title}</span>
                      ) : null}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer avec profil utilisateur */}
      <SidebarFooter className="border-t border-border/20 bg-background/30 backdrop-blur-sm">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-muted hover:bg-muted/50 transition-colors"
                >
                  <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <User className="size-5" />
                  </div>
                  {!state || state === 'expanded' ? (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-foreground">
                        {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                      </span>
                      <span className="truncate text-xs text-muted-foreground font-medium">
                        {user?.email}
                      </span>
                    </div>
                  ) : null}
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="hover:bg-muted cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-3 text-destructive" />
                  <span className="font-medium">Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}