import { Header } from "@/components/Header";
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
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useCreateRide } from "@/hooks/useRides";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Euro, 
  Car,
  Plus,
  X
} from "lucide-react";

const PublishTrip = () => {
  const [date, setDate] = useState<Date>();
  const [options, setOptions] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const createRide = useCreateRide(user?.id);
  const [form, setForm] = useState({
    departure: "",
    destination: "",
    time: "",
    seats: "",
    price: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const seatsTotal = useMemo(()=> Number(form.seats || 0), [form.seats]);
  const priceNum = useMemo(()=> Number(form.price || 0), [form.price]);

  const availableOptions = [
    "Climatisation",
    "Musique autorisée",
    "Animaux acceptés",
    "Non-fumeur",
    "Bagages autorisés",
    "Vélo accepté"
  ];

  const toggleOption = (option: string) => {
    setOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Publier un trajet
            </h1>
            <p className="text-muted-foreground">
              Partagez votre trajet et voyagez ensemble
            </p>
          </div>

          <Card className="glass backdrop-blur-lg border border-border/50 shadow-card">
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
                  <Label htmlFor="departure" className="text-foreground">Départ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="departure"
                      placeholder="Ville de départ"
                      className="pl-10"
                      value={form.departure}
                      onChange={(e)=>setForm(f=>({...f, departure: e.target.value}))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-foreground">Destination</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Ville d'arrivée"
                      className="pl-10"
                      value={form.destination}
                      onChange={(e)=>setForm(f=>({...f, destination: e.target.value}))}
                    />
                  </div>
                </div>
              </div>

              {/* Date et Heure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Date de départ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-foreground">Heure de départ</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      className="pl-10"
                      value={form.time}
                      onChange={(e)=>setForm(f=>({...f, time: e.target.value}))}
                    />
                  </div>
                </div>
              </div>

              {/* Places et Prix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nombre de places</Label>
                  <Select onValueChange={(v)=>setForm(f=>({...f, seats: v}))}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Sélectionner" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} {n>1? 'places':'place'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground">Prix par personne</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="15"
                      className="pl-10"
                      min="0"
                      value={form.price}
                      onChange={(e)=>setForm(f=>({...f, price: e.target.value}))}
                    />
                  </div>
                </div>
              </div>

              {/* Options du trajet */}
              <div className="space-y-2">
                <Label className="text-foreground">Options du trajet</Label>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={options.includes(option) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleOption(option)}
                    >
                      {options.includes(option) ? (
                        <X className="w-3 h-3 mr-1" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1" />
                      )}
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Description (optionnel)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Ajoutez des détails sur votre trajet, points de rendez-vous, etc."
                  className="min-h-[100px]"
                  value={form.description}
                  onChange={(e)=>setForm(f=>({...f, description: e.target.value}))}
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="outline" className="flex-1">
                  Aperçu
                </Button>
                <Button
                  variant="hero"
                  className="flex-1"
                  disabled={saving}
                  onClick={async ()=>{
                    setError(null);
                    if(!user){ navigate('/login'); return; }
                    if(!form.departure.trim() || !form.destination.trim()) { setError('Départ et destination sont obligatoires.'); return; }
                    if(!date || !form.time) { setError('Date et heure sont obligatoires.'); return; }
                    if(!(seatsTotal>0)) { setError('Nombre de places invalide.'); return; }
                    if(priceNum<0) { setError('Prix invalide.'); return; }
                    setSaving(true);
                    try{
                      const iso = (()=>{
                        const [hh,mm] = (form.time||'').split(':');
                        const d = new Date(date);
                        d.setHours(Number(hh||0), Number(mm||0), 0, 0);
                        return d.toISOString();
                      })();
                      const { id } = await createRide.mutateAsync({
                        departure: form.departure,
                        destination: form.destination,
                        departure_time: iso,
                        raw_time: form.time,
                        seats_total: seatsTotal,
                        price: priceNum,
                        description: form.description || undefined,
                        options,
                      });
                      navigate(`/trip/${id}`);
                    } catch(e: unknown){
                      type ErrLike = { message?: string };
                      const msg = (e && typeof e === 'object' && 'message' in e) ? String((e as ErrLike).message || '') : 'Impossible de publier le trajet';
                      setError(msg);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Publier le trajet
                </Button>
              </div>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublishTrip;