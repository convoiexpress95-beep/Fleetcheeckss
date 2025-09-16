import { simplifyStatus, SimplifiedStatus } from './missionStatus';

export interface RawMissionRecord {
	id: string;
	title?: string | null;
	pickup_address?: string | null;
	delivery_address?: string | null;
	donor_earning?: number | null;
	driver_earning?: number | null;
	status?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
}

export interface BuiltMissionSummary {
	id: string;
	title: string;
	route: string;
	earnings: { donor: number; driver: number; margin: number };
	status: SimplifiedStatus;
	createdAt: Date;
	updatedAt: Date;
}

export function buildMissionSummary(raw: RawMissionRecord): BuiltMissionSummary {
	const donor = raw.donor_earning || 0;
	const driver = raw.driver_earning || 0;
	return {
		id: raw.id,
		title: raw.title || 'Mission',
		route: `${raw.pickup_address || '—'} → ${raw.delivery_address || '—'}`,
		earnings: { donor, driver, margin: donor - driver },
		status: simplifyStatus(raw.status as any),
		createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
		updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date(),
	};
}

export function aggregateMargin(list: RawMissionRecord[]): number {
	return list.reduce((acc, m) => acc + ((m.donor_earning||0) - (m.driver_earning||0)), 0);
}
