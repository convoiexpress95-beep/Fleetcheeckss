// Catalogue véhicules (extrait simplifié, à compléter)
import { VehicleModel } from './mission-types';

const brands: Record<string, string[]> = {
  Peugeot: ["208","2008","308","3008","5008","508"],
  Renault: ["Clio","Captur","Mégane","Kadjar","Scénic"],
  Citroën: ["C3","C4","C5 Aircross","Berlingo"],
  Volkswagen: ["Golf","Polo","Tiguan","Passat"],
  BMW: ["Série 1","Série 3","X1"],
  Audi: ["A3","A4","Q2","Q3"],
  Mercedes: ["Classe A","Classe B","Classe C","GLA"],
  Ford: ["Fiesta","Focus","Puma","Kuga"],
  Toyota: ["Yaris","Corolla","C-HR","RAV4"],
  Opel: ["Corsa","Astra","Mokka"],
  Fiat: ["500","Panda","Tipo"],
  Dacia: ["Sandero","Duster","Logan"],
  Skoda: ["Fabia","Octavia","Kamiq"],
  Seat: ["Ibiza","León","Arona"],
  Hyundai: ["i10","i20","i30","Tucson"],
};

const energies = ["Essence","Diesel","Électrique","Hybride"] as const;

export const vehicleCatalog: VehicleModel[] = Object.entries(brands).flatMap(([brand, models]) =>
  models.map((model, idx) => ({
    id: `${brand}-${model}`.replace(/\s+/g,'-'),
    brand,
    model,
    category: 'VL',
    energy: energies[idx % energies.length],
    image: `/placeholder.svg`,
    popular: idx < 2
  }))
);
