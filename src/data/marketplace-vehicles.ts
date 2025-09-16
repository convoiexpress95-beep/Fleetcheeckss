export interface Vehicle {
  id: string;
  name: string;
  category: 'leger' | 'utilitaire' | 'poids_lourd';
  image: string;
  brand: string;
}

export const vehicles: Vehicle[] = [
  // VÉHICULES LÉGERS
  { id: '1', name: 'Renault Clio', category: 'leger', image: '/src/assets/renault-clio-white.jpg', brand: 'Renault' },
  { id: '2', name: 'Renault Mégane', category: 'leger', image: '/src/assets/renault-megane-silver.jpg', brand: 'Renault' },
  { id: '3', name: 'Peugeot 208', category: 'leger', image: '/src/assets/peugeot-208-silver.jpg', brand: 'Peugeot' },
  { id: '4', name: 'Peugeot 308', category: 'leger', image: '/src/assets/peugeot-308-blue.jpg', brand: 'Peugeot' },
  { id: '5', name: 'Peugeot 3008', category: 'leger', image: '/src/assets/peugeot-3008.jpg', brand: 'Peugeot' },
  { id: '6', name: 'Citroën C3', category: 'leger', image: '/src/assets/citroen-c3-blue.jpg', brand: 'Citroën' },
  { id: '7', name: 'Citroën C4', category: 'leger', image: '/src/assets/citroen-c4-blue.jpg', brand: 'Citroën' },
  { id: '8', name: 'Volkswagen Polo', category: 'leger', image: '/src/assets/vw-polo-blue.jpg', brand: 'Volkswagen' },
  { id: '9', name: 'Volkswagen Golf', category: 'leger', image: '/src/assets/vw-golf-white.jpg', brand: 'Volkswagen' },
  { id: '10', name: 'Audi A3', category: 'leger', image: '/src/assets/audi-a3-red.jpg', brand: 'Audi' },
  { id: '11', name: 'Audi A4', category: 'leger', image: '/src/assets/audi-a4.jpg', brand: 'Audi' },
  { id: '12', name: 'BMW Série 1', category: 'leger', image: '/src/assets/bmw-serie1-black.jpg', brand: 'BMW' },
  { id: '13', name: 'BMW Série 3', category: 'leger', image: '/src/assets/bmw-serie3.jpg', brand: 'BMW' },
  { id: '14', name: 'Mercedes Classe A', category: 'leger', image: '/src/assets/mercedes-classe-a-white.jpg', brand: 'Mercedes-Benz' },
  { id: '15', name: 'Mercedes Classe C', category: 'leger', image: '/src/assets/mercedes-c-class.jpg', brand: 'Mercedes-Benz' },
  { id: '16', name: 'Toyota Corolla', category: 'leger', image: '/src/assets/toyota-corolla-white.jpg', brand: 'Toyota' },
  { id: '17', name: 'Honda Civic', category: 'leger', image: '/src/assets/honda-civic-blue.jpg', brand: 'Honda' },
  { id: '18', name: 'Nissan Qashqai', category: 'leger', image: '/src/assets/nissan-qashqai-blue.jpg', brand: 'Nissan' },
  { id: '19', name: 'Tesla Model 3', category: 'leger', image: '/src/assets/tesla-model3-white.jpg', brand: 'Tesla' },
  { id: '20', name: 'Hyundai i30', category: 'leger', image: '/src/assets/hyundai-i30-silver.jpg', brand: 'Hyundai' },

  // VÉHICULES UTILITAIRES  
  { id: '21', name: 'Renault Master', category: 'utilitaire', image: '/src/assets/renault-master-pro.jpg', brand: 'Renault' },
  { id: '22', name: 'Mercedes Sprinter', category: 'utilitaire', image: '/src/assets/utilitaire-sprinter.jpg', brand: 'Mercedes-Benz' },
  { id: '23', name: 'Peugeot Expert', category: 'utilitaire', image: '/src/assets/peugeot-expert.jpg', brand: 'Peugeot' },
  { id: '24', name: 'Peugeot Boxer', category: 'utilitaire', image: '/src/assets/peugeot-boxer-white.jpg', brand: 'Peugeot' },
  { id: '25', name: 'Citroën Jumper', category: 'utilitaire', image: '/src/assets/citroen-jumper-red.jpg', brand: 'Citroën' },
  { id: '26', name: 'Volkswagen Crafter', category: 'utilitaire', image: '/src/assets/vw-crafter-gray.jpg', brand: 'Volkswagen' },
  { id: '27', name: 'Ford Transit', category: 'utilitaire', image: '/src/assets/ford-transit-white.jpg', brand: 'Ford' },
  { id: '28', name: 'Fiat Ducato', category: 'utilitaire', image: '/src/assets/fiat-ducato-silver.jpg', brand: 'Fiat' },
  { id: '29', name: 'Iveco Daily', category: 'utilitaire', image: '/src/assets/iveco-daily-van.jpg', brand: 'Iveco' },

  // POIDS LOURDS
  { id: '30', name: 'Mercedes Actros', category: 'poids_lourd', image: '/src/assets/mercedes-actros-white.jpg', brand: 'Mercedes-Benz' },
  { id: '31', name: 'Volvo FH', category: 'poids_lourd', image: '/src/assets/volvo-fh-red.jpg', brand: 'Volvo' },
  { id: '32', name: 'Scania R Series', category: 'poids_lourd', image: '/src/assets/scania-r-series-green.jpg', brand: 'Scania' },
  { id: '33', name: 'MAN TGX', category: 'poids_lourd', image: '/src/assets/man-tgx-green.jpg', brand: 'MAN' },
  { id: '34', name: 'DAF XF', category: 'poids_lourd', image: '/src/assets/daf-xf-white.jpg', brand: 'DAF' },
  { id: '35', name: 'Renault Trucks T', category: 'poids_lourd', image: '/src/assets/renault-trucks-t-orange.jpg', brand: 'Renault Trucks' },
  { id: '36', name: 'Iveco Stralis', category: 'poids_lourd', image: '/src/assets/iveco-stralis-white.jpg', brand: 'Iveco' }
];

export const getVehiclesByCategory = (category: string) => {
  return vehicles.filter(v => v.category === category);
};

export const getVehicleById = (id: string) => {
  return vehicles.find(v => v.id === id);
};

export const findVehicleByName = (name: string) => {
  return vehicles.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
};

export const getRandomVehicle = () => {
  return vehicles[Math.floor(Math.random() * vehicles.length)];
};