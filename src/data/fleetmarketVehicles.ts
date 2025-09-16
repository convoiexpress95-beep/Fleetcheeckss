// Données véhicules dérivées du sous-projet marketplace
// Simplifiées pour usage FleetMarket
export interface FleetVehicle {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
}

export const vehicles: FleetVehicle[] = [
  { id: '1', name: 'Citadine', brand: 'Renault', category: 'voiture', image: '/vehicles/renault-clio.jpg' },
  { id: '2', name: 'SUV Compact', brand: 'Peugeot', category: 'voiture', image: '/vehicles/peugeot-3008.jpg' },
  { id: '3', name: 'Utilitaire Léger', brand: 'Renault', category: 'utilitaire', image: '/vehicles/placeholder.svg' },
  { id: '4', name: 'Moto', brand: 'Yamaha', category: '2_roues', image: '/silhouettes/moto.svg' },
  { id: '5', name: 'Remorque', brand: 'Générique', category: 'utilitaire', image: '/silhouettes/utilitaire.svg' },
  { id: '6', name: 'Plateau', brand: 'Générique', category: 'utilitaire', image: '/silhouettes/camion.svg' },
];

export function findVehicleByName(name: string){
  return vehicles.find(v => v.name === name);
}

export function getAllBrands(){
  return Array.from(new Set(vehicles.map(v => v.brand))).sort();
}

export function getVehiclesByBrand(brand: string){
  return vehicles.filter(v => v.brand === brand);
}

export function getVehiclesSortedByBrand(){
  return [...vehicles].sort((a,b)=> a.brand.localeCompare(b.brand));
}
