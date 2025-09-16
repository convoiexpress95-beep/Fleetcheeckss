// FleetReport Types
export type MissionStatus = "En attente" | "En cours" | "Livrée" | "Annulée" | "En retard";
export type VehicleCategory = "VL" | "VU" | "PL";
export type EnergyType = "Essence" | "Diesel" | "Électrique" | "Hybride";

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Vehicle {
  brand: string;
  model: string;
  licensePlate: string;
  category: VehicleCategory;
  energy: EnergyType;
  image?: string;
}

export interface Mission {
  id: string;
  client: {
    name: string;
    contact: Contact;
  };
  vehicle: Vehicle;
  departure: {
    address: Address;
    contact: Contact;
    date: string;
    timeSlot: string;
  };
  arrival: {
    address: Address;
    contact: Contact;
    expectedDate: string;
    timeSlot: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: MissionStatus;
  priority: "Normale" | "Urgente";
  distance: number;
  estimatedDuration: number;
  options: {
    gpsTracking: boolean;
    departureInspection: boolean;
    arrivalInspection: boolean;
    roundTrip: boolean;
  };
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleModel {
  id: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  energy: EnergyType;
  image: string;
  popular: boolean;
}

export interface MissionFormData {
  client: {
    name: string;
    contact: Contact;
  };
  vehicle: VehicleModel;
  departure: {
    address: Address;
    contact: Contact;
    date: string;
    timeSlot: string;
  };
  arrival: {
    address: Address;
    contact: Contact;
    expectedDate: string;
    timeSlot: string;
  };
  assignedTo?: string;
  priority: "Normale" | "Urgente";
  options: {
    gpsTracking: boolean;
    departureInspection: boolean;
    arrivalInspection: boolean;
    roundTrip: boolean;
  };
  notes?: string;
  attachments?: File[];
}