import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Car, Menu, Bell, User, Plus } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-primary">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Convoiturage</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            Rechercher
          </a>
          <a href="/publish" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Publier un trajet
          </a>
          <a href="/my-trips" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Mes trajets
          </a>
          <a href="/messages" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Messages
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => window.location.href = '/publish'}>
            <Plus className="w-4 h-4" />
            Publier un trajet
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-destructive text-destructive-foreground">
              3
            </Badge>
          </Button>

          <Avatar className="w-8 h-8 ring-2 ring-primary/20 cursor-pointer" onClick={() => window.location.href = '/profile'}>
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}