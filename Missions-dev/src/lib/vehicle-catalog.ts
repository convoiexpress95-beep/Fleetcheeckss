import peugeot308 from "@/assets/vehicles/peugeot-308.jpg";
import renaultClio from "@/assets/vehicles/renault-clio.jpg";
import volkswagenGolf from "@/assets/vehicles/volkswagen-golf.jpg";
import bmw3Series from "@/assets/vehicles/bmw-3-series.jpg";
import citroenC3 from "@/assets/vehicles/citroen-c3.jpg";
import renaultCaptur from "@/assets/vehicles/renault-captur.jpg";

export interface VehicleModel {
  id: string;
  brand: string;
  model: string;
  category: "VL" | "VU" | "PL";
  energy: "Essence" | "Diesel" | "Électrique" | "Hybride";
  image: string;
  popular: boolean;
}

export const popularVehicles: VehicleModel[] = [
  {
    id: "peugeot-308",
    brand: "Peugeot",
    model: "308",
    category: "VL",
    energy: "Essence",
    image: peugeot308,
    popular: true
  },
  {
    id: "renault-clio",
    brand: "Renault", 
    model: "Clio",
    category: "VL",
    energy: "Essence",
    image: renaultClio,
    popular: true
  },
  {
    id: "volkswagen-golf",
    brand: "Volkswagen",
    model: "Golf",
    category: "VL", 
    energy: "Essence",
    image: volkswagenGolf,
    popular: true
  },
  {
    id: "bmw-3-series",
    brand: "BMW",
    model: "Série 3",
    category: "VL",
    energy: "Diesel",
    image: bmw3Series,
    popular: true
  },
  {
    id: "citroen-c3",
    brand: "Citroën",
    model: "C3",
    category: "VL",
    energy: "Essence", 
    image: citroenC3,
    popular: true
  },
  {
    id: "renault-captur",
    brand: "Renault",
    model: "Captur",
    category: "VL",
    energy: "Essence",
    image: renaultCaptur,
    popular: true
  }
];

export const allVehicles: VehicleModel[] = [
  ...popularVehicles,
  // Véhicules utilitaires populaires
  { id: "renault-trafic", brand: "Renault", model: "Trafic", category: "VU", energy: "Diesel", image: "", popular: false },
  { id: "peugeot-partner", brand: "Peugeot", model: "Partner", category: "VU", energy: "Diesel", image: "", popular: false },
  { id: "ford-transit", brand: "Ford", model: "Transit", category: "VU", energy: "Diesel", image: "", popular: false },
  { id: "mercedes-sprinter", brand: "Mercedes", model: "Sprinter", category: "VU", energy: "Diesel", image: "", popular: false },
  { id: "iveco-daily", brand: "Iveco", model: "Daily", category: "PL", energy: "Diesel", image: "", popular: false },
  // Autres modèles populaires VL
  { id: "dacia-sandero", brand: "Dacia", model: "Sandero", category: "VL", energy: "Essence", image: "", popular: false },
  { id: "toyota-yaris", brand: "Toyota", model: "Yaris", category: "VL", energy: "Hybride", image: "", popular: false },
  { id: "opel-corsa", brand: "Opel", model: "Corsa", category: "VL", energy: "Essence", image: "", popular: false },
  { id: "fiat-500", brand: "Fiat", model: "500", category: "VL", energy: "Essence", image: "", popular: false },
  { id: "audi-a3", brand: "Audi", model: "A3", category: "VL", energy: "Diesel", image: "", popular: false }
];