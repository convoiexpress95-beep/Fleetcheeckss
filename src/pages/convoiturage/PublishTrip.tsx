import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useConvoiturage } from "@/hooks/useConvoiturage";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar as CalendarIcon, Clock, Users, Euro, Car, Plus, X } from "lucide-react";

const PublishTrip = () => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [seats, setSeats] = useState(1);
  const [price, setPrice] = useState<number>(15);
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const { publishRide } = useConvoiturage();
  const { toast } = useToast();

  const availableOptions = [
    "Climatisation",
    "Musique autorisée",
    "Animaux acceptés",
    "Non-fumeur",
    "Bagages autorisés",
    "Vélo accepté",
  ];

  const toggleOption = (option: string) => {
    setOptions((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Publier un trajet</h1>
          <p className="text-muted-foreground">Partagez votre trajet et voyagez ensemble</p>
        </div>

        <Card className="glass-card border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Détails du trajet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Départ et Arrivée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure">Départ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="departure" placeholder="Ville de départ" className="pl-10" value={departure} onChange={(e)=>setDeparture(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="destination" placeholder="Ville d'arrivée" className="pl-10" value={destination} onChange={(e)=>setDestination(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Date et Heure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de départ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure de départ</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="time" type="time" className="pl-10" value={time} onChange={(e)=>setTime(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Places et Prix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de places</Label>
                <Select value={String(seats)} onValueChange={(v)=>setSeats(parseInt(v))}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Sélectionner" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} place{n>1?'s':''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix par personne</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="price" type="number" placeholder="15" className="pl-10" min="0" value={price} onChange={(e)=>setPrice(parseFloat(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Options du trajet */}
            <div className="space-y-2">
              <Label>Options du trajet</Label>
              <div className="flex flex-wrap gap-2">
                {availableOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={options.includes(option) ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleOption(option)}
                  >
                    {options.includes(option) ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea id="description" placeholder="Ajoutez des détails sur votre trajet, points de rendez-vous, etc." className="min-h-[100px]" value={description} onChange={(e)=>setDescription(e.target.value)} />
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="outline" className="flex-1">Aperçu</Button>
              <Button className="flex-1" onClick={async ()=>{
                try {
                  if (!date || !time || !departure || !destination) {
                    toast({ title: "Champs requis", description: "Renseignez départ, destination, date et heure.", variant: "destructive" });
                    return;
                  }
                  const [hh, mm] = time.split(":");
                  const dt = new Date(date);
                  dt.setHours(parseInt(hh||'0'), parseInt(mm||'0'), 0, 0);
                  await publishRide({
                    departure,
                    destination,
                    departure_time: dt.toISOString(),
                    duration_minutes: null,
                    price,
                    seats_total: seats,
                    route: [],
                    description,
                    vehicle_model: null,
                    options,
                    status: 'active',
                  });
                  toast({ title: "Trajet publié", description: "Votre trajet est en ligne." });
                } catch (e: any) {
                  toast({ title: "Erreur", description: e?.message || "Impossible de publier", variant: "destructive" });
                }
              }}>Publier le trajet</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublishTrip;
