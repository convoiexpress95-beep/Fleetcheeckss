import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Car, Menu, Bell, User, Plus, Coins, CreditCard } from "lucide-react";
// Styles inline: nav-link-tq sera défini via classes utilitaires (turquoise)
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useNotificationsSummary } from "@/hooks/useNotificationsSummary";
import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export function Header() {
  const { user, signOut } = useAuth();
  const { balance } = useWalletBalance();
  const { count, pendingDriver, pendingPassenger, unreadMessages } = useNotificationsSummary();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  useEffect(()=>{
    function onDoc(e: MouseEvent){
      if(!notifRef.current) return;
      if(!notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    if(notifOpen) document.addEventListener('mousedown', onDoc);
    return ()=> document.removeEventListener('mousedown', onDoc);
  },[notifOpen]);
  const navigate = useNavigate();
  // Marquer messages comme lus à l'ouverture
  useEffect(()=>{
    if(notifOpen && unreadMessages > 0 && user){
      (async()=>{ try { await supabase.rpc('mark_all_ride_messages_read', { p_user: user.id }); } catch {/* ignore */} })();
    }
  }, [notifOpen, unreadMessages, user]);

  // Génération dynamique des pages de navigation à partir des fichiers dans ../pages
  const navPages = useMemo(()=>{
    // Récupère tous les fichiers .tsx dans pages (niveau racine du module covoiturage)
    const modules = import.meta.glob('../pages/*.tsx');
    const exclude = new Set([
      'NotFound', 'TripDetails', 'UserProfile', 'Login', 'Register', // pages non destinées au menu principal
    ]);
    // Overrides pour labels, paths spécifiques et ordre
    const overrides: Record<string, { label?: string; path?: string; order?: number; hidden?: boolean; }>= {
      Index: { label: 'Rechercher', path: '/' , order: 10 },
      PublishTrip: { label: 'Publier', path: user ? '/publish' : '/login', order: 20 },
      MyTrips: { label: 'Mes trajets', path: '/my-trips', order: 30 },
      Messages: { label: 'Messages', path: '/messages', order: 40 },
      Credits: { label: 'Facturation', path: '/billing', order: 50 },
      Profile: { hidden: true }, // accessible via avatar
    };
    const pages = Object.keys(modules).map(file=>{
      const base = file.split('/').pop()?.replace(/\.tsx$/,'') || '';
      if(!base || exclude.has(base)) return null;
      const ov = overrides[base] || {};
      if(ov.hidden) return null;
      // Fallback path: kebab-case du nom
      const fallbackPath = base === 'Index' ? '/' : '/' + base
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g,'$1-$2')
        .toLowerCase();
      return {
        key: base,
        label: ov.label || base,
        path: ov.path || fallbackPath,
        order: ov.order ?? 999,
      };
    }).filter(Boolean) as { key: string; label: string; path: string; order: number; }[];
    pages.sort((a,b)=> a.order - b.order);
    return pages;
  }, [user]);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass backdrop-blur-lg">
      <style>{`.nav-link-tq{ @apply text-sm font-medium text-teal-500 hover:text-teal-400 transition-colors duration-200; }
      .nav-link-tq.active{ @apply text-teal-300; }`}</style>
      <div className="relative container flex h-16 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-primary">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Convoiturage</h1>
          </div>
        </div>

        {/* Navigation centrée */}
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navPages.map(p=> (
            <Link key={p.key} to={p.path} className="nav-link-tq">
              {p.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto z-10">
          <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
            <Link to={user ? "/publish" : "/login"}>
              <Plus className="w-4 h-4" />
              Publier un trajet
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 pr-2">
            {typeof balance === 'number' && (
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <Coins className="w-4 h-4" /> {balance}
              </div>
            )}
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Notifications"
                onClick={()=> setNotifOpen(o=>!o)}
              >
                <Bell className="w-5 h-5" />
                {count > 0 && (
                  <Badge className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                    {count > 99 ? '99+' : count}
                  </Badge>
                )}
              </Button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-md border border-border/50 bg-background shadow-lg p-3 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Notifications</span>
                    <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Réservations (conducteur)</p>
                        <p className="text-xs text-muted-foreground">En attente sur vos trajets</p>
                      </div>
                      <Badge variant={pendingDriver? 'default':'outline'}>{pendingDriver}</Badge>
                    </li>
                    <li className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Réservations (passager)</p>
                        <p className="text-xs text-muted-foreground">Demandes que vous avez faites</p>
                      </div>
                      <Badge variant={pendingPassenger? 'default':'outline'}>{pendingPassenger}</Badge>
                    </li>
                    <li className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Messages non lus</p>
                        <p className="text-xs text-muted-foreground">Conversations de trajets</p>
                      </div>
                      <Badge variant={unreadMessages? 'destructive':'outline'}>{unreadMessages}</Badge>
                    </li>
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={()=>{ setNotifOpen(false); navigate('/messages'); }}
                    >Ouvrir messages</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={()=>{ setNotifOpen(false); navigate('/my-trips'); }}
                    >Voir trajets</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Avatar className="w-8 h-8 ring-2 ring-primary/20 cursor-pointer">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button size="sm" variant="ghost" onClick={async ()=>{ await signOut(); navigate('/login'); }}>Déconnexion</Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}