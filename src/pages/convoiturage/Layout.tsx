import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function ConvoiturageLayout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const isActive = (to: string) => pathname === to;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 glass-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center shadow-primary">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Convoiturage</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant={isActive('/convoiturage') ? 'default' : 'outline'} size="sm">
              <Link to="/convoiturage">Accueil</Link>
            </Button>
            <Button asChild variant={isActive('/convoiturage/publish') ? 'default' : 'outline'} size="sm">
              <Link to="/convoiturage/publish">Publier</Link>
            </Button>
            <Button asChild variant={isActive('/convoiturage/my-trips') ? 'default' : 'outline'} size="sm">
              <Link to="/convoiturage/my-trips">Mes trajets</Link>
            </Button>
            <Button asChild variant={isActive('/convoiturage/messages') ? 'default' : 'outline'} size="sm">
              <Link to="/convoiturage/messages">Messages</Link>
            </Button>
            <Button asChild variant={isActive('/convoiturage/profile') ? 'default' : 'outline'} size="sm">
              <Link to="/convoiturage/profile">Profil</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
