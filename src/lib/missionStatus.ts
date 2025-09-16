export type RawMissionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'archived' | 'inspection_start' | 'inspection_end' | string;

export type SimplifiedStatus = 'pending' | 'in-progress' | 'delivered' | 'cancelled';

export function simplifyStatus(raw: RawMissionStatus | undefined | null): SimplifiedStatus {
	if (!raw) return 'pending';
	if (['in_progress','inspection_start','inspection_end'].includes(raw)) return 'in-progress';
	if (['completed','delivered'].includes(raw)) return 'delivered';
	if (['cancelled','archived'].includes(raw)) return 'cancelled';
	return 'pending';
}

export function expandStatus(simple: SimplifiedStatus): RawMissionStatus {
	if (simple === 'in-progress') return 'in_progress';
	if (simple === 'delivered') return 'completed';
	if (simple === 'cancelled') return 'cancelled';
	return 'pending';
}

export function isTerminal(simple: SimplifiedStatus): boolean {
	return simple === 'delivered' || simple === 'cancelled';
}

export function statusProgressOrder(simple: SimplifiedStatus): number {
	switch(simple){
		case 'pending': return 0;
		case 'in-progress': return 1;
		case 'delivered': return 2;
		case 'cancelled': return 99;
		default: return 0;
	}
}
