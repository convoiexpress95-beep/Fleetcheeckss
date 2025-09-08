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
  Images
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  { title: "Tableau de bord", url: "/dashboard", icon: Home },
  { title: "Missions", url: "/missions", icon: Truck },
  { title: "Nouvelle mission", url: "/missions/new", icon: Plus },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Suivi GPS", url: "/tracking", icon: MapPin },
  { title: "Rapports", url: "/reports", icon: FileText },
];

const businessItems = (
  isAdmin: boolean
) => [
  { title: "Facturation", url: "/billing", icon: CreditCard },
  { title: "Marketplace", url: "/marketplace", icon: GridIcon },
  { title: "Boutique", url: "/shop", icon: ShoppingCart },
  ...(isAdmin ? [{ title: "Catalogue images", url: "/catalog", icon: Images }] : []),
];

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

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

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-muted text-foreground font-medium" 
      : "hover:bg-muted/50 transition-all duration-300";

  return (
    <Sidebar className="glass-card border-border/20 backdrop-blur-md bg-background/60 supports-[backdrop-filter]:bg-background/20">
      <SidebarContent className="bg-transparent/50 backdrop-blur-sm">
        {/* En-tête: uniquement le nom, sans logo */}
        <div className="p-6 border-b border-border/20 bg-background/30 backdrop-blur-sm">
          <div className="flex items-center">
            {!state || state === 'expanded' ? (
              <h2 className="font-bold text-lg text-foreground">FleetCheecks</h2>
            ) : null}
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

        {/* Business & Facturation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-2">
            Business
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems(!!isAdmin).map((item) => (
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