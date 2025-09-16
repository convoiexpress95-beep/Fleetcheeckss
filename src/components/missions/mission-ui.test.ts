import { describe, test, expect } from 'vitest';
import { dbStatusToUI, uiStatusToDb, mapSupabaseMission } from './mission-ui';

describe('mission-ui mappings', () => {
  test('dbStatusToUI', () => {
    expect(dbStatusToUI('pending')).toBe('pending');
    expect(dbStatusToUI('in_progress')).toBe('in-progress');
    expect(dbStatusToUI('inspection_start')).toBe('in-progress');
    expect(dbStatusToUI('completed')).toBe('delivered');
    expect(dbStatusToUI('delivered')).toBe('delivered');
    expect(dbStatusToUI('cancelled')).toBe('cancelled');
    expect(dbStatusToUI('archived')).toBe('cancelled');
    expect(dbStatusToUI(undefined)).toBe('pending');
  });

  test('uiStatusToDb', () => {
    expect(uiStatusToDb('pending')).toBe('pending');
    expect(uiStatusToDb('in-progress')).toBe('in_progress');
    expect(uiStatusToDb('delivered')).toBe('completed');
    expect(uiStatusToDb('cancelled')).toBe('cancelled');
  });

  test('mapSupabaseMission basic mapping', () => {
    const mission = mapSupabaseMission({
      id: '1',
      donor_profile: { full_name: 'Client X', email: 'c@x.fr' },
      pickup_contact_name: 'Contact',
      pickup_contact_email: 'contact@example.com',
      pickup_contact_phone: '0102030405',
      pickup_address: 'A',
      delivery_address: 'B',
      vehicle_brand: 'Renault',
      vehicle_model_name: 'Clio',
      license_plate: 'AA-123-AA',
      donor_earning: 100,
      status: 'in_progress',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      description: 'Test mission'
    });
    expect(mission.id).toBe('1');
    expect(mission.client.name).toBe('Client X');
    expect(mission.vehicle.brand).toBe('Renault');
    expect(mission.status).toBe('in-progress');
    expect(mission.cost.total).toBe(100);
    expect(mission.notes).toBe('Test mission');
  });
});
