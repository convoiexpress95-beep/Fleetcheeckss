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
import { useState } from "react";
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
                    />
                  </div>
                </div>
              </div>

              {/* Places et Prix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nombre de places</Label>
                  <Select>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Sélectionner" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 place</SelectItem>
                      <SelectItem value="2">2 places</SelectItem>
                      <SelectItem value="3">3 places</SelectItem>
                      <SelectItem value="4">4 places</SelectItem>
                      <SelectItem value="5">5 places</SelectItem>
                      <SelectItem value="6">6 places</SelectItem>
                      <SelectItem value="7">7 places</SelectItem>
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
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="outline" className="flex-1">
                  Aperçu
                </Button>
                <Button variant="hero" className="flex-1">
                  Publier le trajet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublishTrip;