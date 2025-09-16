import { Mission, Client, Employee, Vehicle } from './types';

export const mockClients: Client[] = [
  {
    id: "1",
    name: "AutoPro Distribution",
    contact: {
      name: "Marie Dubois",
      email: "marie.dubois@autopro.fr",
      phone: "01 45 67 89 12"
    },
    address: "12 Rue de la Paix, 75001 Paris"
  },
  {
    id: "2",
    name: "Fleet Solutions",
    contact: {
      name: "Jean Martin",
      email: "j.martin@fleetsolutions.com",
      phone: "02 34 56 78 90"
    },
    address: "45 Avenue des Champs, 69002 Lyon"
  },
  {
    id: "3",
    name: "Express Logistics",
    contact: {
      name: "Sophie Leroy",
      email: "s.leroy@express-logistics.fr",
      phone: "04 12 34 56 78"
    },
    address: "8 Boulevard du Port, 13002 Marseille"
  }
];

export const mockEmployees: Employee[] = [
  { id: "1", name: "Thomas Durand", role: "Convoyeur", avatar: "TD" },
  { id: "2", name: "Sarah Martin", role: "Convoyeur", avatar: "SM" },
  { id: "3", name: "Pierre Moreau", role: "Convoyeur", avatar: "PM" },
  { id: "4", name: "Julie Blanc", role: "Convoyeur", avatar: "JB" },
  { id: "5", name: "Marc Dubois", role: "Manager", avatar: "MD" }
];

export const mockVehicles: Vehicle[] = [
  { id: "1", brand: "Peugeot", model: "308", registration: "AB-123-CD", category: "VL", energy: "Essence" },
  { id: "2", brand: "Renault", model: "Trafic", registration: "EF-456-GH", category: "VU", energy: "Diesel" },
  { id: "3", brand: "Mercedes", model: "Sprinter", registration: "IJ-789-KL", category: "VU", energy: "Diesel" },
  { id: "4", brand: "BMW", model: "X3", registration: "MN-012-OP", category: "VL", energy: "Hybride" },
  { id: "5", brand: "Tesla", model: "Model 3", registration: "QR-345-ST", category: "VL", energy: "Électrique" }
];

export const mockMissions: Mission[] = [
  {
    id: "1",
    client: mockClients[0],
    vehicle: mockVehicles[0],
    itinerary: {
      departure: { 
        address: "Paris Charles de Gaulle Airport, 95700 Roissy-en-France",
        contact: { name: "Marie Lefebvre", phone: "01 48 62 22 80" }
      },
      arrival: { 
        address: "Gare de Lyon, 75012 Paris",
        contact: { name: "Jean Dupont", phone: "01 53 33 60 00" }
      },
      distance: 45,
      duration: 60,
      handoverLocation: "Hall principal, niveau départs"
    },
    schedule: {
      date: new Date("2024-01-15"),
      timeSlot: "09:00 - 10:00",
      flexibility: "±30min",
      urgent: false,
      roundTrip: false
    },
    assignedTo: mockEmployees[0],
    status: "pending",
    cost: { tolls: 15, fuel: 25, miscellaneous: 5, total: 45, estimated: true, credits: 1 },
    documents: ["carte-grise.pdf", "assurance.pdf"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    inspections: { departure: true, arrival: true },
    tracking: { enabled: true },
    notes: "Client VIP - Ponctualité requise"
  },
  {
    id: "2",
    client: mockClients[1],
    vehicle: mockVehicles[1],
    itinerary: {
      departure: { 
        address: "Lyon Part-Dieu, 69003 Lyon",
        contact: { name: "Sophie Martin", phone: "04 72 56 95 30" }
      },
      arrival: { 
        address: "Aéroport Lyon-Saint Exupéry, 69125 Colombier-Saugnieu",
        contact: { name: "Pierre Roux", phone: "04 26 00 70 07" }
      },
      distance: 35,
      duration: 45
    },
    schedule: {
      date: new Date("2024-01-14"),
      timeSlot: "14:00 - 15:00",
      flexibility: "±60min",
      urgent: false,
      roundTrip: true
    },
    assignedTo: mockEmployees[1],
    status: "in-progress",
    cost: { tolls: 8, fuel: 18, miscellaneous: 0, total: 26, estimated: false, credits: 1 },
    documents: ["bon-livraison.pdf"],
    createdAt: new Date("2024-01-09"),
    updatedAt: new Date("2024-01-14"),
    inspections: { departure: true, arrival: false },
    tracking: { enabled: true, currentLocation: { lat: 45.7640, lng: 4.8357 } }
  },
  {
    id: "3",
    client: mockClients[2],
    vehicle: mockVehicles[2],
    itinerary: {
      departure: { address: "Marseille Vieux-Port, 13002 Marseille" },
      arrival: { address: "Aix-en-Provence Centre, 13100 Aix-en-Provence" },
      distance: 42,
      duration: 50
    },
    schedule: {
      date: new Date("2024-01-13"),
      timeSlot: "08:00 - 09:00",
      flexibility: "strict",
      urgent: true,
      roundTrip: false
    },
    assignedTo: mockEmployees[2],
    status: "delivered",
    cost: { tolls: 12, fuel: 22, miscellaneous: 3, total: 37, estimated: false, credits: 1 },
    documents: ["rapport-livraison.pdf", "signature-client.pdf"],
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-13"),
    inspections: { departure: true, arrival: true },
    tracking: { enabled: true }
  },
  {
    id: "4",
    client: mockClients[0],
    vehicle: mockVehicles[3],
    itinerary: {
      departure: { address: "La Défense, 92400 Courbevoie" },
      arrival: { address: "Orly Airport, 94390 Orly" },
      distance: 38,
      duration: 55
    },
    schedule: {
      date: new Date("2024-01-12"),
      timeSlot: "16:30 - 17:30",
      flexibility: "±30min",
      urgent: false,
      roundTrip: false
    },
    status: "cancelled",
    cost: { tolls: 10, fuel: 20, miscellaneous: 0, total: 30, estimated: true, credits: 0 },
    documents: [],
    createdAt: new Date("2024-01-07"),
    updatedAt: new Date("2024-01-12"),
    inspections: { departure: false, arrival: false },
    tracking: { enabled: false },
    notes: "Annulé par le client - changement de planning"
  },
  {
    id: "5",
    client: mockClients[1],
    vehicle: mockVehicles[4],
    itinerary: {
      departure: { address: "Nice Côte d'Azur Airport, 06206 Nice" },
      arrival: { address: "Monaco-Monte-Carlo, 98000 Monaco" },
      distance: 25,
      duration: 35
    },
    schedule: {
      date: new Date("2024-01-16"),
      timeSlot: "11:00 - 12:00",
      flexibility: "±30min",
      urgent: false,
      roundTrip: true
    },
    assignedTo: mockEmployees[3],
    status: "pending",
    cost: { tolls: 5, fuel: 15, miscellaneous: 2, total: 22, estimated: true, credits: 1 },
    documents: ["contrat.pdf"],
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
    inspections: { departure: true, arrival: true },
    tracking: { enabled: true }
  },
  // Mission en retard
  {
    id: "6",
    client: mockClients[2],
    vehicle: mockVehicles[0],
    itinerary: {
      departure: { address: "Toulouse-Blagnac Airport, 31700 Blagnac" },
      arrival: { address: "Toulouse Centre, 31000 Toulouse" },
      distance: 18,
      duration: 25
    },
    schedule: {
      date: new Date("2024-01-13"), // Date passée
      timeSlot: "10:00 - 11:00",
      flexibility: "strict",
      urgent: true,
      roundTrip: false
    },
    assignedTo: mockEmployees[4],
    status: "in-progress",
    cost: { tolls: 3, fuel: 12, miscellaneous: 0, total: 15, estimated: false, credits: 1 },
    documents: ["urgence.pdf"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-13"),
    inspections: { departure: true, arrival: false },
    tracking: { enabled: true, currentLocation: { lat: 43.6047, lng: 1.4442 } },
    notes: "URGENT - Mission en retard, contacter le client immédiatement"
  }
];

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "status-pending";
    case "in-progress": return "status-in-progress";
    case "delivered": return "status-delivered";
    case "cancelled": return "status-cancelled";
    default: return "status-pending";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending": return "En attente";
    case "in-progress": return "En cours";
    case "delivered": return "Livrée";
    case "cancelled": return "Annulée";
    default: return status;
  }
};