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
  Route,
  Sparkles,
  Layers,
  Zap,
  Activity,
  TrendingUp
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { BRAND_NAME } from "@/lib/branding";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";

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

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Activity, badge: "Pro" },
  { title: "Missions", url: "/missions", icon: Layers, count: 12 },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Suivi GPS", url: "/tracking", icon: MapPin, status: "live" },
  { title: "Rapports", url: "/reports", icon: TrendingUp },
];

const businessItems = (
  isAdmin: boolean
) => [
  // { title: "Facturation", url: "/billing", icon: CreditCard }, // déplacé dans la top bar
  { title: "Boutique", url: "/shop", icon: ShoppingCart },
  // Entrée "Catalogue images" supprimée (accès déjà présent via la top bar)
];

// Icône grille supprimée avec la section Raccourcis

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
  let cartCount = 0;
  try {
    // Hook seulement si provider présent (route protégée) – fallback silencieux sinon
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const cart = useCart();
    cartCount = cart.totalCount;
  } catch(_) {}
  const { isAdmin } = useAdmin();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Liens externes Market/Convoiturage supprimés de la sidebar (accès via top bar)

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-muted text-foreground font-medium" 
      : "hover:bg-muted/50 transition-all duration-300";

  return (
    <Sidebar className="border-r border-border/30 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-xl">
      <SidebarContent className="bg-gradient-to-b from-transparent via-background/5 to-background/10">
        {/* En-tête moderne avec logo */}
        <div className="p-6 border-b border-border/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            </div>
            {!state || state === 'expanded' ? (
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {BRAND_NAME}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Fleet Management Suite
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Navigation principale */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-muted-foreground/70 font-semibold text-xs uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10" 
                            : "hover:bg-muted/50 hover:translate-x-1 text-muted-foreground hover:text-foreground"
                        }`
                      }
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        {item.status === 'live' && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      {!state || state === 'expanded' ? (
                        <div className="flex items-center justify-between flex-1">
                          <span className="font-semibold text-sm">{item.title}</span>
                          <div className="flex items-center gap-1">
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-md font-bold uppercase tracking-wider">
                                {item.badge}
                              </span>
                            )}
                            {item.count && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold min-w-[20px] text-center">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

  {/* Section ClearTrip supprimée */}

        {/* Business & Facturation */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="text-muted-foreground/70 font-semibold text-xs uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
            Business
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {businessItems(!!isAdmin).map((item) => {
                const isShop = item.url === '/shop';
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                            isActive 
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-lg shadow-emerald-500/10" 
                              : "hover:bg-muted/50 hover:translate-x-1 text-muted-foreground hover:text-foreground"
                          }`
                        }
                      >
                        <div className="relative">
                          <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                          {isShop && cartCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[9px] leading-none rounded-full px-1.5 py-1 font-bold text-white shadow-md animate-bounce">
                              {cartCount > 99 ? '99+' : cartCount}
                            </span>
                          )}
                        </div>
                        {!state || state === 'expanded' ? (
                          <div className="flex items-center justify-between flex-1">
                            <span className="font-semibold text-sm">{item.title}</span>
                            {isShop && cartCount > 0 && (
                              <span className="text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                                {cartCount} {cartCount>1?'items':'item'}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

  {/* Section "Raccourcis" supprimée (liens accessibles via top bar) */}

        {/* Administration - Visible seulement pour les admins */}
        {isAdmin && (
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="text-amber-600/70 font-semibold text-xs uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
              <Crown className="w-3 h-3 text-amber-500" />
              <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                            isActive 
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-lg shadow-amber-500/10" 
                              : "hover:bg-muted/50 hover:translate-x-1 text-muted-foreground hover:text-amber-600"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 text-amber-500 transition-transform group-hover:scale-110" />
                        {!state || state === 'expanded' ? (
                          <span className="font-semibold text-sm">{item.title}</span>
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
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="text-muted-foreground/70 font-semibold text-xs uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            Profil
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                          isActive 
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-lg shadow-blue-500/10" 
                            : "hover:bg-muted/50 hover:translate-x-1 text-muted-foreground hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {!state || state === 'expanded' ? (
                        <span className="font-semibold text-sm">{item.title}</span>
                      ) : null}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer avec profil utilisateur moderne */}
      <SidebarFooter className="border-t border-border/20 bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="group relative p-2 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-border/30"
                >
                  <div className="relative">
                    <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg">
                      <User className="size-5" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                  </div>
                  {!state || state === 'expanded' ? (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-bold text-foreground flex items-center gap-2">
                        {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      </span>
                      <span className="truncate text-xs text-muted-foreground font-medium">
                        {user?.email}
                      </span>
                    </div>
                  ) : null}
                  <ChevronUp className="ml-auto size-4 transition-transform group-hover:rotate-180" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-background/95 backdrop-blur-xl border border-border/20 shadow-2xl"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="group hover:bg-destructive/10 cursor-pointer rounded-lg p-3 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3 text-destructive group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-destructive">Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}