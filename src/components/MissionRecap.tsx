import React from 'react';
import { Building2, Car, Clock, MapPin, User, Users } from 'lucide-react';

export type MissionRecapData = {
  title: string;
  description: string;
  pickup_address: string;
  delivery_address: string;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  pickup_contact_email: string;
  delivery_contact_name: string;
  delivery_contact_phone: string;
  delivery_contact_email: string;
  pickup_date: string;
  pickup_time: string;
  delivery_date: string;
  delivery_time: string;
  vehicle_type: string;
  license_plate: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: string;
  assigned_to: 'self' | 'contact' | string;
  assigned_contact_id: string;
  driver_earning?: string;
  // EDL (non persisté)
  edl_ext?: string;
  edl_int?: string;
  edl_km?: string;
  edl_carburant?: string;
};

function formatDate(date?: string) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
}

function formatTime(time?: string) {
  return time || '';
}

export default function MissionRecap({ data, innerRef }: { data: MissionRecapData; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={innerRef} className="rounded-xl overflow-hidden shadow-2xl bg-[white] text-slate-900">
      {/* Bandeau header */}
      <div className="p-6 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Récapitulatif de mission</h2>
              <p className="text-white/90">Document généré par FleetCheck</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Date</div>
            <div className="font-semibold">{new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Titre / Description */}
        <section>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Informations générales
          </h3>
          <div className="rounded-lg border border-slate-200 p-4 bg-white">
            <div className="font-bold text-xl mb-1">{data.title || '—'}</div>
            <div className="text-slate-700 whitespace-pre-wrap">{data.description || '—'}</div>
          </div>
        </section>

        {/* Véhicule */}
        <section>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-600" />
            Véhicule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-xs uppercase text-slate-500">Type</div>
              <div className="font-medium">{data.vehicle_type || '—'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-xs uppercase text-slate-500">Immatriculation</div>
              <div className="font-medium">{data.license_plate || '—'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-xs uppercase text-slate-500">Marque / Modèle</div>
              <div className="font-medium">{[data.vehicle_brand, data.vehicle_model].filter(Boolean).join(' ') || '—'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-xs uppercase text-slate-500">Année</div>
              <div className="font-medium">{data.vehicle_year || '—'}</div>
            </div>
          </div>
        </section>

        {/* Logistique */}
        <section>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pink-600" />
            Logistique
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-semibold text-emerald-700 mb-2">Départ</div>
              <div className="text-sm"><span className="text-slate-500">Adresse: </span>{data.pickup_address || '—'}</div>
              <div className="text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(data.pickup_date)} {formatTime(data.pickup_time)}</div>
              <div className="text-sm flex items-center gap-1"><User className="w-3 h-3" /> {data.pickup_contact_name || '—'}</div>
              <div className="text-sm">{data.pickup_contact_phone || '—'} • {data.pickup_contact_email || '—'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-semibold text-rose-700 mb-2">Arrivée</div>
              <div className="text-sm"><span className="text-slate-500">Adresse: </span>{data.delivery_address || '—'}</div>
              <div className="text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(data.delivery_date)} {formatTime(data.delivery_time)}</div>
              <div className="text-sm flex items-center gap-1"><User className="w-3 h-3" /> {data.delivery_contact_name || '—'}</div>
              <div className="text-sm">{data.delivery_contact_phone || '—'} • {data.delivery_contact_email || '—'}</div>
            </div>
          </div>
        </section>

        {/* Assignation */}
        <section>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Assignation
          </h3>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm"><span className="text-slate-500">Type: </span>{data.assigned_to === 'contact' ? 'Contact' : 'Moi-même'}</div>
            {data.assigned_to === 'contact' && (
              <div className="text-sm"><span className="text-slate-500">Contact ID: </span>{data.assigned_contact_id || '—'}</div>
            )}
            {data.driver_earning && (
              <div className="mt-2 text-sm">
                <span className="text-slate-500">Revenu convoyeur: </span>
                <span className="font-semibold">{Number.parseFloat(data.driver_earning).toFixed(2)} €</span>
              </div>
            )}
          </div>
        </section>

        {/* État des lieux */}
        {(data.edl_ext || data.edl_int || data.edl_km || data.edl_carburant) && (
          <section>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-700" />
              État des lieux
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs uppercase text-slate-500">Extérieur</div>
                <div className="whitespace-pre-wrap">{data.edl_ext || '—'}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs uppercase text-slate-500">Intérieur</div>
                <div className="whitespace-pre-wrap">{data.edl_int || '—'}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs uppercase text-slate-500">Kilométrage</div>
                <div>{data.edl_km || '—'}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs uppercase text-slate-500">Carburant</div>
                <div>{data.edl_carburant || '—'}</div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Pied de page */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 bg-slate-50">
        Document généré automatiquement. © FleetCheck
      </div>
    </div>
  );
}
