import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Calendar, Clock, Euro, Truck, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PostMarketplaceMission() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departure: '',
    arrival: '',
    departureDate: '',
    arrivalDate: '',
    vehicleType: '',
    price: '',
    distance: '',
    duration: '',
    isUrgent: false
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulation d'envoi des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Mission publiée avec succès !",
        description: "Votre mission est maintenant visible par les convoyeurs.",
      });
      
      // Redirection vers le marketplace
      navigate('/marketplace');
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de publier la mission. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/marketplace')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Marketplace
            </Button>
            <div className="h-6 w-px bg-gray-600"></div>
            <h1 className="text-2xl font-bold text-white">Publier une Mission</h1>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="w-6 h-6 text-cyan-500" />
                Nouvelle Mission de Convoyage
              </CardTitle>
              <CardDescription className="text-gray-400">
                Remplissez les informations ci-dessous pour publier votre mission sur le marketplace
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-200">Titre de la mission *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ex: Transport BMW Série 3 - Paris vers Lyon"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType" className="text-gray-200">Type de véhicule *</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white">
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="berline">Berline</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="utilitaire">Utilitaire</SelectItem>
                        <SelectItem value="premium">Véhicule Premium</SelectItem>
                        <SelectItem value="moto">Moto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Itinéraire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="departure" className="text-gray-200 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      Lieu de départ *
                    </Label>
                    <Input
                      id="departure"
                      value={formData.departure}
                      onChange={(e) => handleInputChange('departure', e.target.value)}
                      placeholder="Ex: Paris (75001)"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="arrival" className="text-gray-200 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Lieu d'arrivée *
                    </Label>
                    <Input
                      id="arrival"
                      value={formData.arrival}
                      onChange={(e) => handleInputChange('arrival', e.target.value)}
                      placeholder="Ex: Lyon (69001)"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="departureDate" className="text-gray-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Date de départ *
                    </Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => handleInputChange('departureDate', e.target.value)}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="arrivalDate" className="text-gray-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      Date d'arrivée *
                    </Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                      required
                    />
                  </div>
                </div>

                {/* Prix et détails */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-200 flex items-center gap-2">
                      <Euro className="w-4 h-4 text-green-500" />
                      Prix (€) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="850"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="distance" className="text-gray-200">Distance (km)</Label>
                    <Input
                      id="distance"
                      value={formData.distance}
                      onChange={(e) => handleInputChange('distance', e.target.value)}
                      placeholder="465"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-gray-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      Durée estimée
                    </Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="4h 30min"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-200">Description de la mission</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre mission : état du véhicule, instructions spéciales, contacts..."
                    className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 min-h-[100px]"
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/marketplace')}
                    className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                  >
                    Annuler
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Publication...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Publier la Mission
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
