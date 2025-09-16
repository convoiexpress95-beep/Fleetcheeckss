export type MissionStatus = "pending" | "in-progress" | "delivered" | "cancelled";

export interface Mission {
  id: string;
  client: Client;
  vehicle: Vehicle;
  itinerary: Itinerary;
  schedule: Schedule;
  assignedTo?: Employee;
  status: MissionStatus;
  cost: Cost;
  notes?: string;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
  inspections: {
    departure?: boolean;
    arrival?: boolean;
  };
  tracking: {
    enabled: boolean;
    currentLocation?: {
      lat: number;
      lng: number;
    };
  };
}

export interface Client {
  id: string;
  name: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  address: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration: string;
  category: "VL" | "VU" | "PL";
  energy: "Essence" | "Diesel" | "Électrique" | "Hybride";
}

export interface Itinerary {
  departure: {
    address: string;
    coordinates?: { lat: number; lng: number };
    contact?: {
      name: string;
      phone: string;
    };
  };
  arrival: {
    address: string;
    coordinates?: { lat: number; lng: number };
    contact?: {
      name: string;
      phone: string;
    };
  };
  distance: number; // km
  duration: number; // minutes
  handoverLocation?: string;
}

export interface Schedule {
  date: Date;
  timeSlot: string;
  flexibility: "±30min" | "±60min" | "strict";
  urgent: boolean;
  roundTrip: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: "Convoyeur" | "Manager" | "Admin";
  avatar?: string;
}

export interface Cost {
  tolls: number;
  fuel: number;
  miscellaneous: number;
  total: number;
  estimated: boolean;
  credits: number;
}

export interface MissionFilters {
  search: string;
  status: MissionStatus[];
  client: string[];
  assignedTo: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

export type ViewMode = "list" | "kanban";