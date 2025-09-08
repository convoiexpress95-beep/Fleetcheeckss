import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, MapPin, Users } from "lucide-react";

export function SearchForm({ onSearch }: { onSearch?: (params: { departure?: string; destination?: string; date?: Date; passengers?: number }) => void }) {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);

  const handleSearch = () => {
    onSearch?.({ departure, destination, date, passengers });
  };

  return (
  <div className="w-full max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-card border border-border/50">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Départ */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Départ
          </label>
          <Input
            placeholder="D'où partez-vous ?"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Destination
          </label>
          <Input
            placeholder="Où allez-vous ?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy", { locale: fr }) : "Choisir une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Passagers */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Passagers
          </label>
          <Input
            type="number"
            min="1"
            max="8"
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value))}
            className="h-12"
          />
        </div>

        {/* Bouton recherche */}
  <Button onClick={handleSearch} className="h-12 glow-hover" size="lg">
          Rechercher
        </Button>
      </div>
    </div>
  );
}
