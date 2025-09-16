export type Mission = { id: string; title: string; created_at: string };
export type Inspection = { id: string; mission_id: string; status: string; created_at: string };
export type Rapport = { id: string; inspection_id: string; url?: string; created_at: string };
