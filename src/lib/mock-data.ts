import { Mission } from './types';

export const mockMissions: Mission[] = [
  {
    id: '1',
    client: {
      name: 'Renault Distribution',
      contact: {
        name: 'Pierre Dubois',
        email: 'p.dubois@renault.fr',
        phone: '01 45 23 67 89'
      }
    },
    vehicle: {
      brand: 'Renault',
      model: 'Clio',
      licensePlate: 'AA-123-BB',
      category: 'VL',
      energy: 'Essence',
      image: '/vehicles/renault-clio.jpg'
    },
    departure: {
      address: {
        street: '15 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        country: 'France'
      },
      contact: {
        name: 'Marie Laurent',
        email: 'm.laurent@depot-paris.fr',
        phone: '01 42 56 78 90'
      },
      date: '2025-01-15',
      timeSlot: '08:00-10:00'
    },
    arrival: {
      address: {
        street: '45 Rue de la République',
        city: 'Lyon',
        postalCode: '69002',
        country: 'France'
      },
      contact: {
        name: 'Jean Martin',
        email: 'j.martin@concession-lyon.fr',
        phone: '04 78 45 12 34'
      },
      expectedDate: '2025-01-15',
      timeSlot: '16:00-18:00'
    },
    assignedTo: {
      id: '1',
      name: 'Thomas Leroy',
      avatar: '/avatars/thomas-leroy.jpg'
    },
    status: 'En cours',
    priority: 'Normale',
    distance: 462,
    estimatedDuration: 280,
    options: {
      gpsTracking: true,
      departureInspection: true,
      arrivalInspection: true,
      roundTrip: false
    },
    notes: 'Véhicule neuf - Attention particulière aux rayures',
    createdAt: '2025-01-14T08:30:00Z',
    updatedAt: '2025-01-14T10:15:00Z'
  },
  {
    id: '2',
    client: {
      name: 'Peugeot Paris',
      contact: {
        name: 'Sophie Bernard',
        email: 's.bernard@peugeot-paris.fr',
        phone: '01 47 85 96 30'
      }
    },
    vehicle: {
      brand: 'Peugeot',
      model: '3008',
      licensePlate: 'BB-456-CC',
      category: 'VL',
      energy: 'Diesel',
      image: '/vehicles/peugeot-3008.jpg'
    },
    departure: {
      address: {
        street: '28 Boulevard Haussmann',
        city: 'Paris',
        postalCode: '75009',
        country: 'France'
      },
      contact: {
        name: 'Antoine Moreau',
        email: 'a.moreau@depot75.fr',
        phone: '01 48 74 85 20'
      },
      date: '2025-01-16',
      timeSlot: '09:30-11:30'
    },
    arrival: {
      address: {
        street: '12 Avenue de la Gare',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France'
      },
      contact: {
        name: 'Lucie Petit',
        email: 'l.petit@marseille-auto.fr',
        phone: '04 91 23 45 67'
      },
      expectedDate: '2025-01-17',
      timeSlot: '14:00-16:00'
    },
    status: 'En attente',
    priority: 'Urgente',
    distance: 775,
    estimatedDuration: 460,
    options: {
      gpsTracking: true,
      departureInspection: false,
      arrivalInspection: true,
      roundTrip: true
    },
    createdAt: '2025-01-14T14:20:00Z',
    updatedAt: '2025-01-14T14:20:00Z'
  },
  {
    id: '3',
    client: {
      name: 'BMW Toulouse',
      contact: {
        name: 'Michel Rousseau',
        email: 'm.rousseau@bmw-toulouse.fr',
        phone: '05 61 78 45 12'
      }
    },
    vehicle: {
      brand: 'BMW',
      model: 'Série 3',
      licensePlate: 'CC-789-DD',
      category: 'VL',
      energy: 'Diesel',
      image: '/vehicles/bmw-serie3.jpg'
    },
    departure: {
      address: {
        street: '67 Allée Jean Jaurès',
        city: 'Toulouse',
        postalCode: '31000',
        country: 'France'
      },
      contact: {
        name: 'Valérie Blanc',
        email: 'v.blanc@toulouse-depot.fr',
        phone: '05 62 11 22 33'
      },
      date: '2025-01-13',
      timeSlot: '07:00-09:00'
    },
    arrival: {
      address: {
        street: '89 Place Bellecour',
        city: 'Lyon',
        postalCode: '69002',
        country: 'France'
      },
      contact: {
        name: 'Alain Durand',
        email: 'a.durand@bmw-lyon.fr',
        phone: '04 72 33 44 55'
      },
      expectedDate: '2025-01-13',
      timeSlot: '15:00-17:00'
    },
    assignedTo: {
      id: '2',
      name: 'Julie Garnier',
      avatar: '/avatars/julie-garnier.jpg'
    },
    status: 'Livrée',
    priority: 'Normale',
    distance: 540,
    estimatedDuration: 320,
    options: {
      gpsTracking: true,
      departureInspection: true,
      arrivalInspection: true,
      roundTrip: false
    },
    notes: 'Livraison effectuée dans les temps',
    createdAt: '2025-01-12T16:45:00Z',
    updatedAt: '2025-01-13T17:30:00Z'
  },
  {
    id: '4',
    client: {
      name: 'Audi Bordeaux',
      contact: {
        name: 'Catherine Simon',
        email: 'c.simon@audi-bordeaux.fr',
        phone: '05 56 78 90 12'
      }
    },
    vehicle: {
      brand: 'Audi',
      model: 'Q3',
      licensePlate: 'DD-012-EE',
      category: 'VL',
      energy: 'Diesel',
      image: '/vehicles/audi-q3.jpg'
    },
    departure: {
      address: {
        street: '34 Cours de l\'Intendance',
        city: 'Bordeaux',
        postalCode: '33000',
        country: 'France'
      },
      contact: {
        name: 'François Lefevre',
        email: 'f.lefevre@bordeaux-centre.fr',
        phone: '05 57 22 33 44'
      },
      date: '2025-01-18',
      timeSlot: '10:00-12:00'
    },
    arrival: {
      address: {
        street: '156 Avenue des Ternes',
        city: 'Paris',
        postalCode: '75017',
        country: 'France'
      },
      contact: {
        name: 'Nathalie Roux',
        email: 'n.roux@audi-paris17.fr',
        phone: '01 45 67 89 01'
      },
      expectedDate: '2025-01-18',
      timeSlot: '20:00-22:00'
    },
    status: 'En attente',
    priority: 'Normale',
    distance: 579,
    estimatedDuration: 360,
    options: {
      gpsTracking: true,
      departureInspection: true,
      arrivalInspection: false,
      roundTrip: false
    },
    createdAt: '2025-01-14T11:20:00Z',
    updatedAt: '2025-01-14T11:20:00Z'
  },
  {
    id: '5',
    client: {
      name: 'Mercedes Strasbourg',
      contact: {
        name: 'Philippe Moreau',
        email: 'p.moreau@mercedes-strasbourg.fr',
        phone: '03 88 45 67 89'
      }
    },
    vehicle: {
      brand: 'Mercedes',
      model: 'GLA',
      licensePlate: 'EE-345-FF',
      category: 'VL',
      energy: 'Diesel',
      image: '/vehicles/mercedes-gla.jpg'
    },
    departure: {
      address: {
        street: '78 Route du Rhin',
        city: 'Strasbourg',
        postalCode: '67000',
        country: 'France'
      },
      contact: {
        name: 'Isabelle Dubois',
        email: 'i.dubois@depot-strasbourg.fr',
        phone: '03 89 12 34 56'
      },
      date: '2025-01-12',
      timeSlot: '13:30-15:30'
    },
    arrival: {
      address: {
        street: '23 Rue de Rivoli',
        city: 'Paris',
        postalCode: '75004',
        country: 'France'
      },
      contact: {
        name: 'Olivier Vincent',
        email: 'o.vincent@mercedes-paris4.fr',
        phone: '01 42 78 90 12'
      },
      expectedDate: '2025-01-12',
      timeSlot: '19:00-21:00'
    },
    assignedTo: {
      id: '3',
      name: 'Marc Fontaine',
      avatar: '/avatars/marc-fontaine.jpg'
    },
    status: 'En retard',
    priority: 'Urgente',
    distance: 492,
    estimatedDuration: 290,
    options: {
      gpsTracking: true,
      departureInspection: true,
      arrivalInspection: true,
      roundTrip: false
    },
    notes: 'Retard dû aux conditions météorologiques',
    createdAt: '2025-01-11T09:15:00Z',
    updatedAt: '2025-01-12T20:30:00Z'
  },
  {
    id: '6',
    client: {
      name: 'Volkswagen Lille',
      contact: {
        name: 'Éric Lemoine',
        email: 'e.lemoine@vw-lille.fr',
        phone: '03 20 45 67 89'
      }
    },
    vehicle: {
      brand: 'Volkswagen',
      model: 'Tiguan',
      licensePlate: 'FF-678-GG',
      category: 'VL',
      energy: 'Diesel',
      image: '/vehicles/vw-tiguan.jpg'
    },
    departure: {
      address: {
        street: '102 Rue Nationale',
        city: 'Lille',
        postalCode: '59000',
        country: 'France'
      },
      contact: {
        name: 'Sandrine Legrand',
        email: 's.legrand@lille-auto.fr',
        phone: '03 21 56 78 90'
      },
      date: '2025-01-10',
      timeSlot: '14:00-16:00'
    },
    arrival: {
      address: {
        street: '55 Boulevard Saint-Germain',
        city: 'Paris',
        postalCode: '75005',
        country: 'France'
      },
      contact: {
        name: 'Christophe Morel',
        email: 'c.morel@vw-paris5.fr',
        phone: '01 43 67 89 01'
      },
      expectedDate: '2025-01-10',
      timeSlot: '19:30-21:30'
    },
    assignedTo: {
      id: '4',
      name: 'Sarah Mercier',
      avatar: '/avatars/sarah-mercier.jpg'
    },
    status: 'Livrée',
    priority: 'Normale',
    distance: 293,
    estimatedDuration: 180,
    options: {
      gpsTracking: false,
      departureInspection: false,
      arrivalInspection: true,
      roundTrip: false
    },
    notes: 'Mission standard - RAS',
    createdAt: '2025-01-09T13:40:00Z',
    updatedAt: '2025-01-10T21:45:00Z'
  },
  {
    id: '7',
    client: {
      name: 'Toyota Nantes',
      contact: {
        name: 'Anne-Marie Girard',
        email: 'am.girard@toyota-nantes.fr',
        phone: '02 40 12 34 56'
      }
    },
    vehicle: {
      brand: 'Toyota',
      model: 'C-HR',
      licensePlate: 'GG-901-HH',
      category: 'VL',
      energy: 'Hybride',
      image: '/vehicles/toyota-chr.jpg'
    },
    departure: {
      address: {
        street: '89 Quai de la Fosse',
        city: 'Nantes',
        postalCode: '44000',
        country: 'France'
      },
      contact: {
        name: 'Julien Barbier',
        email: 'j.barbier@nantes-depot.fr',
        phone: '02 41 23 45 67'
      },
      date: '2025-01-19',
      timeSlot: '08:30-10:30'
    },
    arrival: {
      address: {
        street: '67 Avenue Montaigne',
        city: 'Paris',
        postalCode: '75008',
        country: 'France'
      },
      contact: {
        name: 'Patricia Lemaire',
        email: 'p.lemaire@toyota-paris8.fr',
        phone: '01 44 56 78 90'
      },
      expectedDate: '2025-01-19',
      timeSlot: '16:30-18:30'
    },
    status: 'En attente',
    priority: 'Normale',
    distance: 386,
    estimatedDuration: 240,
    options: {
      gpsTracking: true,
      departureInspection: true,
      arrivalInspection: true,
      roundTrip: false
    },
    createdAt: '2025-01-14T15:55:00Z',
    updatedAt: '2025-01-14T15:55:00Z'
  },
  {
    id: '8',
    client: {
      name: 'Ford Montpellier',
      contact: {
        name: 'Régis Dufour',
        email: 'r.dufour@ford-montpellier.fr',
        phone: '04 67 89 01 23'
      }
    },
    vehicle: {
      brand: 'Ford',
      model: 'Puma',
      licensePlate: 'HH-234-II',
      category: 'VL',
      energy: 'Essence',
      image: '/vehicles/ford-puma.jpg'
    },
    departure: {
      address: {
        street: '145 Avenue de Palavas',
        city: 'Montpellier',
        postalCode: '34000',
        country: 'France'
      },
      contact: {
        name: 'Céline Perrin',
        email: 'c.perrin@montpellier-auto.fr',
        phone: '04 68 90 12 34'
      },
      date: '2025-01-11',
      timeSlot: '11:00-13:00'
    },
    arrival: {
      address: {
        street: '34 Cours Mirabeau',
        city: 'Aix-en-Provence',
        postalCode: '13100',
        country: 'France'
      },
      contact: {
        name: 'Damien Roussel',
        email: 'd.roussel@ford-aix.fr',
        phone: '04 42 56 78 90'
      },
      expectedDate: '2025-01-11',
      timeSlot: '15:30-17:30'
    },
    assignedTo: {
      id: '5',
      name: 'Kevin Dupont',
      avatar: '/avatars/kevin-dupont.jpg'
    },
    status: 'Livrée',
    priority: 'Normale',
    distance: 172,
    estimatedDuration: 120,
    options: {
      gpsTracking: false,
      departureInspection: true,
      arrivalInspection: false,
      roundTrip: true
    },
    notes: 'Aller-retour dans la journée',
    createdAt: '2025-01-10T08:20:00Z',
    updatedAt: '2025-01-11T18:00:00Z'
  },
  {
    id: '9',
    client: {
      name: 'Opel Nancy',
      contact: {
        name: 'Sylvie Chevalier',
        email: 's.chevalier@opel-nancy.fr',
        phone: '03 83 45 67 89'
      }
    },
    vehicle: {
      brand: 'Opel',
      model: 'Mokka',
      licensePlate: 'II-567-JJ',
      category: 'VL',
      energy: 'Essence',
      image: '/vehicles/opel-mokka.jpg'
    },
    departure: {
      address: {
        street: '78 Place Stanislas',
        city: 'Nancy',
        postalCode: '54000',
        country: 'France'
      },
      contact: {
        name: 'Frédéric Muller',
        email: 'f.muller@nancy-depot.fr',
        phone: '03 84 56 78 90'
      },
      date: '2025-01-17',
      timeSlot: '07:30-09:30'
    },
    arrival: {
      address: {
        street: '123 Rue de la Paix',
        city: 'Reims',
        postalCode: '51100',
        country: 'France'
      },
      contact: {
        name: 'Monique Lambert',
        email: 'm.lambert@opel-reims.fr',
        phone: '03 26 67 89 01'
      },
      expectedDate: '2025-01-17',
      timeSlot: '12:00-14:00'
    },
    status: 'En attente',
    priority: 'Normale',
    distance: 158,
    estimatedDuration: 105,
    options: {
      gpsTracking: true,
      departureInspection: false,
      arrivalInspection: true,
      roundTrip: false
    },
    createdAt: '2025-01-14T16:30:00Z',
    updatedAt: '2025-01-14T16:30:00Z'
  },
  {
    id: '10',
    client: {
      name: 'Citroën Nice',
      contact: {
        name: 'Bruno Fabre',
        email: 'b.fabre@citroen-nice.fr',
        phone: '04 93 12 34 56'
      }
    },
    vehicle: {
      brand: 'Citroën',
      model: 'C5 Aircross',
      licensePlate: 'JJ-890-KK',
      category: 'VL',
      energy: 'Diesel',
      image: '/vehicles/citroen-c5-aircross.jpg'
    },
    departure: {
      address: {
        street: '56 Promenade des Anglais',
        city: 'Nice',
        postalCode: '06000',
        country: 'France'
      },
      contact: {
        name: 'Laëtitia Costa',
        email: 'l.costa@nice-auto.fr',
        phone: '04 94 23 45 67'
      },
      date: '2025-01-09',
      timeSlot: '15:00-17:00'
    },
    arrival: {
      address: {
        street: '245 Boulevard de la Croisette',
        city: 'Cannes',
        postalCode: '06400',
        country: 'France'
      },
      contact: {
        name: 'Thierry Martini',
        email: 't.martini@citroen-cannes.fr',
        phone: '04 93 34 56 78'
      },
      expectedDate: '2025-01-09',
      timeSlot: '17:30-19:30'
    },
    assignedTo: {
      id: '1',
      name: 'Thomas Leroy',
      avatar: '/avatars/thomas-leroy.jpg'
    },
    status: 'Annulée',
    priority: 'Normale',
    distance: 32,
    estimatedDuration: 45,
    options: {
      gpsTracking: false,
      departureInspection: false,
      arrivalInspection: false,
      roundTrip: false
    },
    notes: 'Annulée par le client - report à une date ultérieure',
    createdAt: '2025-01-08T12:15:00Z',
    updatedAt: '2025-01-09T14:20:00Z'
  }
];

export const mockDrivers = [
  { id: '1', name: 'Thomas Leroy', avatar: '/avatars/thomas-leroy.jpg' },
  { id: '2', name: 'Julie Garnier', avatar: '/avatars/julie-garnier.jpg' },
  { id: '3', name: 'Marc Fontaine', avatar: '/avatars/marc-fontaine.jpg' },
  { id: '4', name: 'Sarah Mercier', avatar: '/avatars/sarah-mercier.jpg' },
  { id: '5', name: 'Kevin Dupont', avatar: '/avatars/kevin-dupont.jpg' }
];

export const getMissionsByStatus = (status: string) => {
  if (status === 'all') return mockMissions;
  return mockMissions.filter(mission => mission.status === status);
};

export const getMissionsByPriority = (priority: 'Normale' | 'Urgente') => {
  return mockMissions.filter(mission => mission.priority === priority);
};

export const getTodayMissions = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockMissions.filter(mission => 
    mission.departure.date === today || mission.arrival.expectedDate === today
  );
};

export const getActiveMissions = () => {
  return mockMissions.filter(mission => 
    mission.status === 'En cours' || mission.status === 'En attente'
  );
};

export const getLateMissions = () => {
  return mockMissions.filter(mission => mission.status === 'En retard');
};

export const getCompletedMissions = () => {
  return mockMissions.filter(mission => mission.status === 'Livrée');
};