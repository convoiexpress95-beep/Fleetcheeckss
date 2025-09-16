import React, { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Car,
  Truck,
  Package,
  CheckCircle
} from 'lucide-react';
import { Mission, MissionStatus } from '@/lib/mission-types';

// -------- Schéma Zod ---------
export const newMissionFormSchema = z.object({
  // Client
  clientName: z.string().min(2,'Nom client requis'),
  clientContact: z.object({
    name: z.string().min(2,'Nom du contact requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(6,'Téléphone requis')
  }),
  
  // Véhicule
  vehicle: z.object({
    brand: z.string().min(1,'Marque requise'),
    model: z.string().min(1,'Modèle requis'),
    licensePlate: z.string().min(4,'Immatriculation requise').toUpperCase(),
    category: z.enum(['VL','VU','PL']).default('VL'),
    energy: z.enum(['Essence','Diesel','Électrique','Hybride']).default('Essence'),
    image: z.string().optional()
  }),
  
  // Trajet
  departure: z.object({
    address: z.object({
      street: z.string().min(2,'Rue requise'),
      city: z.string().min(2,'Ville requise'),
      postalCode: z.string().min(2,'Code postal requis'),
      country: z.string().default('France')
    }),
    contact: z.object({
      name: z.string().min(2,'Nom du contact requis'),
      email: z.string().email('Email invalide'),
      phone: z.string().min(6,'Téléphone requis')
    }),
    date: z.string().min(4,'Date de départ requise'),
    timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/,'Format HH:MM-HH:MM')
  }),
  arrival: z.object({
    address: z.object({
      street: z.string().min(2,'Rue requise'),
      city: z.string().min(2,'Ville requise'),
      postalCode: z.string().min(2,'Code postal requis'),
      country: z.string().default('France')
    }),
    contact: z.object({
      name: z.string().min(2,'Nom du contact requis'),
      email: z.string().email('Email invalide'),
      phone: z.string().min(6,'Téléphone requis')
    }),
    expectedDate: z.string().min(4,'Date d\'arrivée requise'),
    timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/,'Format HH:MM-HH:MM')
  }),
  
  // Options
  assignedDriver: z.string().optional(),
  options: z.object({
    gpsTracking: z.boolean().default(true),
    departureInspection: z.boolean().default(false),
    arrivalInspection: z.boolean().default(false),
    roundTrip: z.boolean().default(false)
  }),
  
  // Notes
  notes: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  priority: z.enum(['Normale','Urgente']).default('Normale')
});

export type NewMissionFormValues = z.infer<typeof newMissionFormSchema>;

// Valeurs par défaut
const defaultValues: NewMissionFormValues = {
  clientName: '',
  clientContact: {
    name: '',
    email: '',
    phone: ''
  },
  vehicle: {
    brand: '',
    model: '',
    licensePlate: '',
    category: 'VL',
    energy: 'Essence',
    image: undefined
  },
  departure: {
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    contact: {
      name: '',
      email: '',
      phone: ''
    },
    date: '',
    timeSlot: '08:00-18:00'
  },
  arrival: {
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    contact: {
      name: '',
      email: '',
      phone: ''
    },
    expectedDate: '',
    timeSlot: '08:00-18:00'
  },
  assignedDriver: undefined,
  options: {
    gpsTracking: true,
    departureInspection: false,
    arrivalInspection: false,
    roundTrip: false
  },
  notes: '',
  attachments: [],
  priority: 'Normale'
};

// Icônes des catégories de véhicule
const vehicleCategoryIcons = {
  VL: <Car className="w-5 h-5" />,
  VU: <Package className="w-5 h-5" />,
  PL: <Truck className="w-5 h-5" />
};

const vehicleCategoryLabels = {
  VL: 'Véhicule Léger',
  VU: 'Véhicule Utilitaire',
  PL: 'Poids Lourd'
};

export interface NewMissionStepMeta {
  step: number;
  title: string;
  isComplete: boolean;
  canAccess: boolean;
  icon: React.ReactNode;
}

interface NewMissionFormProps {
  step: number;
  setStep: (n: number) => void;
  onSubmitMission: (m: Mission) => void;
  close: () => void;
  totalSteps: number;
  onStepMeta?: (meta: NewMissionStepMeta[]) => void;
  highestVisited: number;
  onValuesChange?: (vals: NewMissionFormValues) => void;
  initialValues?: Partial<NewMissionFormValues>;
}

export const NewMissionForm: React.FC<NewMissionFormProps> = ({ 
  step, 
  setStep, 
  onSubmitMission, 
  totalSteps, 
  onValuesChange, 
  initialValues 
}) => {
  const draftKey = 'new_mission_form_draft_v2';
  const draftLoadedRef = useRef(false);
  
  const finalDefaultValues = useMemo(() => ({
    ...defaultValues,
    ...initialValues
  }), [initialValues]);

  const methods = useForm<NewMissionFormValues>({ 
    defaultValues: finalDefaultValues, 
    resolver: zodResolver(newMissionFormSchema) as any, 
    mode: 'onBlur' 
  });

  const { handleSubmit, watch } = methods;
  const values = watch();

  // Hash simple (stable tant que contenu JSON identique)
  const lastHashRef = useRef<string>('');
  const currentHash = JSON.stringify(values);

  // Sauvegarde brouillon
  useEffect(() => {
    if(!draftLoadedRef.current) return;
    if (currentHash === lastHashRef.current) return; // pas de changement réel
    lastHashRef.current = currentHash;
    onValuesChange?.(values);
    try {
      localStorage.setItem(draftKey, JSON.stringify(values));
    } catch {}
  }, [currentHash, values, draftKey]);

  // Charger brouillon une seule fois
  useEffect(() => {
    if (draftLoadedRef.current) return;
    
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        methods.reset({ ...finalDefaultValues, ...parsed });
      }
      draftLoadedRef.current = true;
    } catch {}
  }, [draftKey, finalDefaultValues]);

  // Soumission du formulaire
  const onSubmit = (vals: NewMissionFormValues) => {
    const mission: Mission = {
      id: 'MISS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      status: 'En attente' as MissionStatus,
      client: { 
        name: vals.clientName, 
        contact: vals.clientContact
      },
      vehicle: vals.vehicle,
      departure: vals.departure,
      arrival: vals.arrival,
      priority: vals.priority,
      distance: 0,
      estimatedDuration: 0,
      options: vals.options,
      attachments: vals.attachments,
      notes: vals.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (vals.assignedDriver) {
      mission.assignedTo = { 
        id: vals.assignedDriver, 
        name: vals.assignedDriver
      };
    }

    onSubmitMission(mission);
  };

  // Navigation entre étapes
  const canProceed = (targetStep: number) => {
    switch (targetStep) {
      case 2:
        return values.clientName && values.clientContact.name && values.clientContact.phone;
      case 3:
        return values.vehicle.brand && values.vehicle.model && values.vehicle.licensePlate;
      case 4:
        return values.departure.address.city && values.departure.contact.phone && 
               values.arrival.address.city && values.arrival.contact.phone;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceed(step + 1) && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar avec informations actuelles */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          {vehicleCategoryIcons[values.vehicle.category]}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{values.clientName || '—'}</span>
            </div>
            <div className="text-muted-foreground text-xs">
              {values.vehicle.brand && values.vehicle.model ? 
                `${values.vehicle.brand} ${values.vehicle.model}` : 
                'Véhicule non défini'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Étape 1 - Infos Mission */}
          {step === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-xl font-semibold">Informations Client</h3>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="clientName">Nom du client</Label>
                  <Input 
                    id="clientName"
                    {...methods.register('clientName')} 
                    placeholder="Nom du client..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientContactName">Contact - Nom</Label>
                    <Input 
                      id="clientContactName"
                      {...methods.register('clientContact.name')} 
                      placeholder="Nom du contact"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientContactPhone">Contact - Téléphone</Label>
                    <Input 
                      id="clientContactPhone"
                      type="tel"
                      {...methods.register('clientContact.phone')} 
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="clientContactEmail">Contact - Email</Label>
                  <Input 
                    id="clientContactEmail"
                    type="email"
                    {...methods.register('clientContact.email')} 
                    placeholder="contact@client.fr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 - Véhicule */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h3 className="text-xl font-semibold">Véhicule</h3>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label>Catégorie de véhicule</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {(['VL', 'VU', 'PL'] as const).map((category) => (
                      <label
                        key={category}
                        className={cn(
                          "relative flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all",
                          values.vehicle.category === category
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <input
                          type="radio"
                          value={category}
                          {...methods.register('vehicle.category')}
                          className="sr-only"
                        />
                        {vehicleCategoryIcons[category]}
                        <span className="text-sm font-medium">{vehicleCategoryLabels[category]}</span>
                        {values.vehicle.category === category && (
                          <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleBrand">Marque</Label>
                    <Input 
                      id="vehicleBrand"
                      {...methods.register('vehicle.brand')} 
                      placeholder="Renault, Peugeot..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleModel">Modèle</Label>
                    <Input 
                      id="vehicleModel"
                      {...methods.register('vehicle.model')} 
                      placeholder="Clio, 208..."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licensePlate">Immatriculation</Label>
                    <Input 
                      id="licensePlate"
                      {...methods.register('vehicle.licensePlate')} 
                      placeholder="AA-123-BB"
                    />
                  </div>
                  <div>
                    <Label htmlFor="energy">Énergie</Label>
                    <Select value={values.vehicle.energy} onValueChange={(value) => methods.setValue('vehicle.energy', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type d'énergie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Essence">Essence</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Électrique">Électrique</SelectItem>
                        <SelectItem value="Hybride">Hybride</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Précédent
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Étape {step} sur {totalSteps}
            </div>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed(step + 1)}
              >
                Suivant
              </Button>
            ) : (
              <Button type="submit">
                Créer la mission
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};