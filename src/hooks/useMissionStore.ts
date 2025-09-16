import { useState, useMemo, useCallback } from 'react';
import { missionsMock } from '@/lib/mission-mock-data';
import { Mission, MissionStatus } from '@/lib/mission-types';

export type ViewMode = 'list' | 'kanban';
export interface MissionFiltersState {
  search: string;
  status: MissionStatus[];
  client: string[];
  convoyeur: string[];
  dateFrom?: string;
  dateTo?: string;
}

export function useMissionStore() {
  const [missions, setMissions] = useState<Mission[]>(missionsMock);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<MissionFiltersState>({ search: '', status: [], client: [], convoyeur: [] });
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{field: 'createdAt'|'departureDate'|'status'; dir: 'asc'|'desc'}>({field:'createdAt', dir:'desc'});
  const pageSize = 20;

  const filtered = useMemo(() => {
    const base = missions.filter(m => {
      const matchesSearch = !filters.search || [
        m.client.name, m.vehicle.brand, m.vehicle.model, m.vehicle.licensePlate,
        m.departure.address.city, m.arrival.address.city
      ].some(v => v.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesStatus = filters.status.length === 0 || filters.status.includes(m.status);
      const matchesClient = filters.client.length === 0 || filters.client.includes(m.client.name);
      const matchesConvoyeur = filters.convoyeur.length === 0 || (m.assignedTo && filters.convoyeur.includes(m.assignedTo.name));
      const matchesDate = (!filters.dateFrom || m.departure.date >= filters.dateFrom) && (!filters.dateTo || m.departure.date <= filters.dateTo);
      return matchesSearch && matchesStatus && matchesClient && matchesConvoyeur && matchesDate;
    });
    const sorted = [...base].sort((a,b)=>{
      let av: string|number = '';
      let bv: string|number = '';
      if(sort.field==='createdAt'){ av = a.createdAt; bv = b.createdAt; }
      if(sort.field==='departureDate'){ av = a.departure.date; bv = b.departure.date; }
      if(sort.field==='status'){ av = a.status; bv = b.status; }
      if(av < bv) return sort.dir==='asc' ? -1 : 1;
      if(av > bv) return sort.dir==='asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [missions, filters]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const addMission = useCallback((mission: Mission) => {
    setMissions(prev => [mission, ...prev]);
  }, []);

  const updateMissionStatus = useCallback((id: string, status: MissionStatus) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status, updatedAt: new Date().toISOString() } : m));
  }, []);

  const removeMission = useCallback((id:string)=>{
    setMissions(prev => prev.filter(m=>m.id!==id));
  },[]);

  const toggleSort = useCallback((field: 'createdAt'|'departureDate'|'status')=>{
    setSort(prev => prev.field===field ? {field, dir: prev.dir==='asc'?'desc':'asc'} : {field, dir:'asc'});
  },[]);

  return { missions, viewMode, setViewMode, filters, setFilters, page, setPage, pageItems, pageCount, addMission, updateMissionStatus, removeMission, filtered, sort, toggleSort };
}
