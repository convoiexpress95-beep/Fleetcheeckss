import React from 'react';
import { MissionFormValues } from './MissionForm';

interface Props { values: MissionFormValues; }
export const MissionPrintSummary: React.FC<Props> = ({ values }) => {
  return (
    <div className="print-summary font-sans text-[12px] leading-relaxed p-6 space-y-4">
      <h1 className="text-xl font-bold mb-4">Résumé mission (brouillon)</h1>
      <section>
        <h2 className="font-semibold text-sm mb-1">Client</h2>
        <div>{values.clientName}</div>
        <div className="text-slate-500">{values.clientContact.name} • {values.clientContact.email} • {values.clientContact.phone}</div>
      </section>
      <section>
        <h2 className="font-semibold text-sm mb-1">Véhicule</h2>
        <div>{values.vehicle.brand} {values.vehicle.model} — {values.vehicle.licensePlate}</div>
        <div className="text-slate-500">{values.vehicle.category} • {values.vehicle.energy}</div>
      </section>
      <section className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-xs mb-1">Départ</h3>
          <div>{values.departure.address.street}</div>
          <div>{values.departure.address.postalCode} {values.departure.address.city} ({values.departure.address.country})</div>
          <div>{values.departure.date} {values.departure.timeSlot}</div>
          <div className="text-slate-500 text-[11px]">{values.departure.contact.name} • {values.departure.contact.email} • {values.departure.contact.phone}</div>
        </div>
        <div>
          <h3 className="font-medium text-xs mb-1">Arrivée</h3>
          <div>{values.arrival.address.street}</div>
          <div>{values.arrival.address.postalCode} {values.arrival.address.city} ({values.arrival.address.country})</div>
          <div>{values.arrival.expectedDate} {values.arrival.timeSlot}</div>
          <div className="text-slate-500 text-[11px]">{values.arrival.contact.name} • {values.arrival.contact.email} • {values.arrival.contact.phone}</div>
        </div>
      </section>
      <section>
        <h2 className="font-semibold text-sm mb-1">Options & priorité</h2>
        <div>Priorité: {values.priority}</div>
        <div className="text-slate-500 text-[11px] mt-1">GPS: {values.options.gpsTracking? 'Oui':'Non'} | Insp. départ: {values.options.departureInspection? 'Oui':'Non'} | Insp. arrivée: {values.options.arrivalInspection? 'Oui':'Non'} | Aller-retour: {values.options.roundTrip? 'Oui':'Non'}</div>
      </section>
      {values.assignedDriver && (
        <section>
          <h2 className="font-semibold text-sm mb-1">Affectation</h2>
          <div>Chauffeur / Opérateur: {values.assignedDriver}</div>
        </section>
      )}
      {values.notes && (
        <section>
          <h2 className="font-semibold text-sm mb-1">Notes</h2>
          <div className="whitespace-pre-wrap text-[11px] bg-slate-100/60 p-2 rounded border border-slate-300/60">{values.notes}</div>
        </section>
      )}
      {values.attachments?.length>0 && (
        <section>
          <h2 className="font-semibold text-sm mb-1">Pièces jointes</h2>
          <ul className="list-disc ml-4 text-[11px] space-y-1">
            {values.attachments.map((a,i)=>(<li key={i}>{a}</li>))}
          </ul>
        </section>
      )}
      <footer className="pt-4 mt-4 border-t border-slate-300 text-[10px] text-slate-500">Généré le {new Date().toLocaleString()}</footer>
    </div>
  );
};
