// Mock data interne dérivé de missions-dev pour intégration temporaire
// NOTE: À remplacer par les données Supabase (hook useMissions) prochainement.

export type MissionStatus = 'pending' | 'in-progress' | 'delivered' | 'cancelled';

export interface MissionMock {
  id: string;
  client: { id: string; name: string; contact: { name: string; email: string; phone: string }; address: string; };
  vehicle: { id: string; brand: string; model: string; registration: string; category: string; energy: string };
  itinerary: { departure: { address: string }; arrival: { address: string }; distance: number; duration: number };
  schedule: { date: Date; timeSlot: string; flexibility: string; urgent: boolean; roundTrip: boolean };
  assignedTo?: { id: string; name: string; role: string; avatar?: string };
  status: MissionStatus;
  cost: { tolls: number; fuel: number; miscellaneous: number; total: number; estimated: boolean; credits: number };
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
  inspections: { departure?: boolean; arrival?: boolean };
  tracking: { enabled: boolean };
  notes?: string;
}

export const mockMissions: MissionMock[] = [
  {
    id: '1',
    client: { id: '1', name: 'AutoPro Distribution', contact: { name: 'Marie Dubois', email: 'marie@example.com', phone: '01 45 67 89 12' }, address: '12 Rue de la Paix, Paris' },
    vehicle: { id: '1', brand: 'Peugeot', model: '308', registration: 'AB-123-CD', category: 'VL', energy: 'Essence' },
    itinerary: { departure: { address: 'Paris CDG' }, arrival: { address: 'Gare de Lyon' }, distance: 45, duration: 60 },
    schedule: { date: new Date('2025-01-15'), timeSlot: '09:00 - 10:00', flexibility: '±30min', urgent: false, roundTrip: false },
    assignedTo: { id: 'e1', name: 'Thomas Durand', role: 'Convoyeur', avatar: 'TD' },
    status: 'pending',
    cost: { tolls: 15, fuel: 25, miscellaneous: 5, total: 45, estimated: true, credits: 1 },
    documents: ['carte-grise.pdf'],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
    inspections: { departure: true, arrival: true },
    tracking: { enabled: true },
    notes: 'Client VIP'
  },
  {
    id: '2',
    client: { id: '2', name: 'Fleet Solutions', contact: { name: 'Jean Martin', email: 'jean@example.com', phone: '02 34 56 78 90' }, address: 'Lyon' },
    vehicle: { id: '2', brand: 'Renault', model: 'Trafic', registration: 'EF-456-GH', category: 'VU', energy: 'Diesel' },
    itinerary: { departure: { address: 'Lyon Part-Dieu' }, arrival: { address: 'Aéroport Lyon' }, distance: 35, duration: 45 },
    schedule: { date: new Date('2025-01-14'), timeSlot: '14:00 - 15:00', flexibility: '±60min', urgent: false, roundTrip: true },
    assignedTo: { id: 'e2', name: 'Sarah Martin', role: 'Convoyeur', avatar: 'SM' },
    status: 'in-progress',
    cost: { tolls: 8, fuel: 18, miscellaneous: 0, total: 26, estimated: false, credits: 1 },
    documents: ['bon-livraison.pdf'],
    createdAt: new Date('2025-01-09'),
    updatedAt: new Date('2025-01-14'),
    inspections: { departure: true, arrival: false },
    tracking: { enabled: true }
  }
];
