import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CreateRideInput {
  departure: string;
  destination: string;
  departure_time: string; // ISO string
  // UI-only: raw time from <input type="time"> (e.g. "18:51") used for fallback when DB expects TIME
  raw_time?: string;
  price: number;
  seats_total: number;
  description?: string;
  options?: string[];
  vehicle_model?: string;
}

export interface RideRow {
  id: string;
  driver_id: string;
  departure: string;
  destination: string;
  departure_time: string; // timestamptz or time string in some envs
  duration_minutes: number | null;
  price: number;
  seats_total: number;
  seats_available?: number; // generated column
  route?: string[] | null;
  description?: string | null;
  vehicle_model?: string | null;
  options?: string[] | null;
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

const RIDE_KEY = (id?: string) => ['conv','ride', id];
const RIDES_LIST_KEY = (filters?: { departure?: string; destination?: string; date?: string }) => ['conv','rides', filters?.departure||'', filters?.destination||'', filters?.date||''];

export interface RideListItem extends RideRow {
  driver_profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    is_convoyeur_confirme?: boolean | null;
  } | null;
}

// Liste des trajets avec éventuels filtres simples (départ, destination, date au format YYYY-MM-DD)
export function useRidesList(filters?: { departure?: string; destination?: string; date?: string }, limit = 20){
  return useQuery({
    queryKey: RIDES_LIST_KEY(filters),
    queryFn: async (): Promise<RideListItem[]> => {
      let q = supabase
        .from('rides')
        .select('*')
        .eq('status','active')
        .order('departure_time', { ascending: true })
        .limit(limit);
      if(filters?.departure){ q = q.ilike('departure', `%${filters.departure}%`); }
      if(filters?.destination){ q = q.ilike('destination', `%${filters.destination}%`); }
      if(filters?.date){ q = q.gte('departure_time', `${filters.date}T00:00:00`).lte('departure_time', `${filters.date}T23:59:59`); }
      const { data, error } = await q;
      if(error) throw error;
      const rows = (data||[]) as Record<string, unknown>[];

      // Normaliser + collecter driver_ids pour charger les profils en un seul appel
      const driverIds = new Set<string>();
      const normalized: RideListItem[] = rows.map((row) => {
        const pickStr = (o: Record<string, unknown>, key: string, altKeys: string[] = []) => {
          if(typeof o[key] === 'string') return o[key] as string;
          for(const k of altKeys){ if(typeof o[k] === 'string') return o[k] as string; }
          return '';
        };
        const pickNum = (o: Record<string, unknown>, key: string) => typeof o[key] === 'number' ? (o[key] as number) : (typeof o[key] === 'string' ? Number(o[key]) : NaN);
        const pickOptNum = (o: Record<string, unknown>, key: string) => {
          const v = o[key];
          if(typeof v === 'number') return v;
          if(typeof v === 'string' && v.trim() !== '') return Number(v);
          return undefined;
        };
        const pickStrArr = (o: Record<string, unknown>, key: string) => Array.isArray(o[key]) ? (o[key] as string[]) : null;

        const legacyDate = pickStr(row, 'date');
        const legacyTime = legacyDate ? pickStr(row, 'time') : '';
        const depTimeCombined = ((): string => {
          const dep = pickStr(row, 'departure_time');
          if(dep) return dep;
          if(legacyDate) return `${legacyDate}T${legacyTime || '00:00:00'}`;
          return '';
        })();

        const driver_id = pickStr(row, 'driver_id', ['user_id']);
        if(driver_id) driverIds.add(driver_id);
        return {
          id: pickStr(row, 'id'),
          driver_id,
          departure: pickStr(row, 'departure', ['from_city']),
          destination: pickStr(row, 'destination', ['to_city']),
          departure_time: depTimeCombined,
          duration_minutes: ((): number | null => {
            const n = pickNum(row, 'duration_minutes');
            return Number.isFinite(n) ? n : null;
          })(),
          price: ((): number => {
            const n = pickNum(row, 'price');
            return Number.isFinite(n) ? n : 0;
          })(),
          seats_total: ((): number => {
            const n = pickNum(row, 'seats_total');
            return Number.isFinite(n) ? n : 1;
          })(),
          seats_available: pickOptNum(row, 'seats_available'),
          route: pickStrArr(row, 'route'),
          description: pickStr(row, 'description') || null,
          vehicle_model: pickStr(row, 'vehicle_model') || null,
          options: pickStrArr(row, 'options'),
          status: ((): 'active' | 'cancelled' | 'completed' => {
            const v = pickStr(row, 'status');
            return v === 'cancelled' || v === 'completed' ? v : 'active';
          })(),
          created_at: pickStr(row, 'created_at') || new Date().toISOString(),
          updated_at: pickStr(row, 'updated_at') || new Date().toISOString(),
          driver_profile: null,
        };
      });

      // Charger profils des conducteurs (affichage nom/avatar/flag vérifié)
      if(driverIds.size){
        const ids = Array.from(driverIds);
        type Prof = { id: string; display_name: string | null; avatar_url: string | null; is_convoyeur_confirme?: boolean | null };
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, is_convoyeur_confirme')
          .in('id', ids);
        const byId: Record<string, Prof> = Object.fromEntries(((profs||[]) as Prof[]).map((p)=>[p.id, p]));
        normalized.forEach(n => {
          const p = byId[n.driver_id];
          if(p) n.driver_profile = p;
        });
      }
      return normalized;
    }
  });
}

export function useRide(id?: string){
  return useQuery({
    queryKey: RIDE_KEY(id),
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('id', id!)
        .single();
      if(error) throw error;
      // Normaliser les noms de colonnes (compat legacy from_city/to_city)
      const row = data as unknown as Record<string, unknown>;
      const pickStr = (o: Record<string, unknown>, key: string, altKeys: string[] = []) => {
        if(typeof o[key] === 'string') return o[key] as string;
        for(const k of altKeys){ if(typeof o[k] === 'string') return o[k] as string; }
        return '';
      };
      const pickNum = (o: Record<string, unknown>, key: string) => typeof o[key] === 'number' ? (o[key] as number) : (typeof o[key] === 'string' ? Number(o[key]) : NaN);
      const pickOptNum = (o: Record<string, unknown>, key: string) => {
        const v = o[key];
        if(typeof v === 'number') return v;
        if(typeof v === 'string' && v.trim() !== '') return Number(v);
        return undefined;
      };
      const pickStrArr = (o: Record<string, unknown>, key: string) => Array.isArray(o[key]) ? (o[key] as string[]) : null;

      // Construire departure_time avec fallback sur colonnes legacy date/time
      const legacyDate = pickStr(row, 'date');
      const legacyTime = legacyDate ? pickStr(row, 'time') : '';
      const depTimeCombined = ((): string => {
        const dep = pickStr(row, 'departure_time');
        if(dep) return dep;
        if(legacyDate) return `${legacyDate}T${legacyTime || '00:00:00'}`;
        return '';
      })();

      const normalized: RideRow = {
        id: pickStr(row, 'id'),
        driver_id: pickStr(row, 'driver_id', ['user_id']),
        departure: pickStr(row, 'departure', ['from_city']),
        destination: pickStr(row, 'destination', ['to_city']),
        departure_time: depTimeCombined,
        duration_minutes: ((): number | null => {
          const n = pickNum(row, 'duration_minutes');
          return Number.isFinite(n) ? n : null;
        })(),
        price: ((): number => {
          const n = pickNum(row, 'price');
          return Number.isFinite(n) ? n : 0;
        })(),
        seats_total: ((): number => {
          const n = pickNum(row, 'seats_total');
          return Number.isFinite(n) ? n : 1;
        })(),
        seats_available: pickOptNum(row, 'seats_available'),
        route: pickStrArr(row, 'route'),
        description: pickStr(row, 'description') || null,
        vehicle_model: pickStr(row, 'vehicle_model') || null,
        options: pickStrArr(row, 'options'),
        status: ((): 'active' | 'cancelled' | 'completed' => {
          const v = pickStr(row, 'status');
          return v === 'cancelled' || v === 'completed' ? v : 'active';
        })(),
        created_at: pickStr(row, 'created_at') || new Date().toISOString(),
        updated_at: pickStr(row, 'updated_at') || new Date().toISOString(),
      };
      return normalized;
    }
  });
}

export function useCreateRide(userId?: string) {
  return useMutation({
    mutationFn: async (ride: CreateRideInput) => {
      if(!userId) throw new Error('Not authenticated');
      if(!ride.departure?.trim() || !ride.destination?.trim()) throw new Error('Départ et destination requis');
      if(!ride.departure_time) throw new Error('Date/heure requise');
      if(!(ride.seats_total > 0)) throw new Error('Nombre de places invalide');
      if(!(ride.price >= 0)) throw new Error('Prix invalide');

      const basePayload = {
        driver_id: userId,
        departure: ride.departure.trim(),
        destination: ride.destination.trim(),
        departure_time: ride.departure_time,
        price: ride.price,
        seats_total: ride.seats_total,
        description: ride.description || null,
        options: ride.options || [],
        vehicle_model: ride.vehicle_model || null,
      } as const;
      const tryInsert = async (patch: Record<string, unknown>) => {
        const { data, error } = await supabase
          .from('rides')
          .insert(patch)
          .select('id')
          .single();
        return { data: data as { id: string } | null, error: error as unknown };
      };

      // Essai 1: schéma "nouveau" (driver_id, departure, destination) + timestamptz
  const r1 = await tryInsert({ ...basePayload });
  if(!r1.error && r1.data) return r1.data;
  let error = r1.error;

      // helpers d'analyse d'erreurs
      const getErrorMessage = (err: unknown) => {
        if(typeof err === 'string') return err;
        if(err && typeof err === 'object'){
          const anyErr = err as Record<string, unknown>;
          if(typeof anyErr.message === 'string') return anyErr.message as string;
          try { return JSON.stringify(err); } catch { /* ignore */ }
        }
        return '';
      };
      const missingColumn = (msg: string, col: string) => {
        const s = msg.toLowerCase();
        const c = col.toLowerCase();
        return (
          s.includes(`could not find the '${c}' column`) ||
          s.includes(`could not find the "${c}" column`) ||
          (s.includes('in the schema cache') && s.includes(`'${c}'`)) ||
          new RegExp(`column .*\\b${col}\\b .* does not exist`, 'i').test(msg) ||
          new RegExp(`column .*\\b${col}\\b .* of relation`, 'i').test(msg)
        );
      };
      const notNullColumn = (msg: string, col: string) => {
        return new RegExp(`null value in column .*"${col}".* not-null`, 'i').test(msg);
      };

      // Si l’erreur concerne le type TIME, fallback HH:MM:SS sur le même schéma
      let msg = getErrorMessage(error);
      if(/type\s+time/i.test(msg) || /invalid input syntax for type time/i.test(msg)){
        let hhmmss = '00:00:00';
        if(ride.raw_time){
          const [hh='00', mm='00'] = ride.raw_time.split(':');
          hhmmss = `${hh.padStart(2,'0')}:${mm.padStart(2,'0')}:00`;
        } else {
          try{
            const dt = new Date(ride.departure_time);
            const hh = String(dt.getHours()).padStart(2,'0');
            const mm = String(dt.getMinutes()).padStart(2,'0');
            hhmmss = `${hh}:${mm}:00`;
          }catch(_err){ /* ignore */ }
        }
  const r2 = await tryInsert({ ...basePayload, departure_time: hhmmss });
  if(!r2.error && r2.data) return r2.data;
  error = r2.error; msg = getErrorMessage(error);
  console.warn('[createRide] fallback new-schema TIME->HH:MM:SS failed:', msg);
      }

      // Si le schéma attend 'seats' (et pas 'seats_total') ou si 'seats_total' est inconnu
      if(missingColumn(msg, 'seats_total') || notNullColumn(msg, 'seats')){
        const { seats_total, ...rest } = basePayload as Record<string, unknown>;
        const r1seats = await tryInsert({ ...rest, seats: ride.seats_total });
        if(!r1seats.error && r1seats.data) return r1seats.data;
        const msgS = getErrorMessage(r1seats.error);
        console.warn('[createRide] fallback new-schema seats->seats failed:', msgS);
        // Si maintenant 'seats_total' est NOT NULL, tenter avec les deux colonnes
        if(notNullColumn(msgS, 'seats_total')){
          const r1both = await tryInsert({ ...basePayload, seats: ride.seats_total });
          if(!r1both.error && r1both.data) return r1both.data;
          console.warn('[createRide] fallback new-schema seats + seats_total failed:', getErrorMessage(r1both.error));
        }
      }

      // Essai 2: schéma "legacy" (user_id, from_city, to_city)
      const legacyBase: Record<string, unknown> = {
        user_id: userId,
        from_city: basePayload.departure,
        to_city: basePayload.destination,
        departure_time: basePayload.departure_time,
        price: basePayload.price,
        seats_total: basePayload.seats_total,
        description: basePayload.description,
        options: basePayload.options,
        vehicle_model: basePayload.vehicle_model,
      };
  let r3 = await tryInsert(legacyBase);
  if(!r3.error && r3.data) return r3.data;
  const msg3 = getErrorMessage(r3.error);
  console.warn('[createRide] legacy schema attempt failed:', msg3);
      // Schéma legacy: peut exiger 'seats' au lieu de 'seats_total'
      if(missingColumn(msg3, 'seats_total') || notNullColumn(msg3, 'seats')){
        const { seats_total, ...legacyNoSeatsTotal } = legacyBase as Record<string, unknown>;
        const r3seats = await tryInsert({ ...legacyNoSeatsTotal, seats: basePayload.seats_total });
        if(!r3seats.error && r3seats.data) return r3seats.data;
        const msg3s = getErrorMessage(r3seats.error);
        console.warn('[createRide] legacy seats->seats failed:', msg3s);
        if(notNullColumn(msg3s, 'seats_total')){
          const r3both = await tryInsert({ ...legacyBase, seats: basePayload.seats_total });
          if(!r3both.error && r3both.data) return r3both.data;
          console.warn('[createRide] legacy seats + seats_total failed:', getErrorMessage(r3both.error));
        }
      }
      if(/type\s+time/i.test(msg3) || /invalid input syntax for type time/i.test(msg3)){
        let hhmmss = '00:00:00';
        if(ride.raw_time){
          const [hh='00', mm='00'] = ride.raw_time.split(':');
          hhmmss = `${hh.padStart(2,'0')}:${mm.padStart(2,'0')}:00`;
        } else {
          try{
            const dt = new Date(ride.departure_time);
            const hh = String(dt.getHours()).padStart(2,'0');
            const mm = String(dt.getMinutes()).padStart(2,'0');
            hhmmss = `${hh}:${mm}:00`;
          }catch(_err){ /* ignore */ }
        }
  r3 = await tryInsert({ ...legacyBase, departure_time: hhmmss });
  if(!r3.error && r3.data) return r3.data;
  console.warn('[createRide] legacy TIME->HH:MM:SS failed:', getErrorMessage(r3.error));
      }

      // Essai 3bis: schéma legacy strict avec colonnes séparées date (YYYY-MM-DD) et time (HH:MM:SS)
      {
        let yyyyMmDd = '';
        try{
          const dt = new Date(ride.departure_time);
          yyyyMmDd = dt.toISOString().slice(0,10);
        }catch{ /* ignore */ }
        let hhmmss = '00:00:00';
        if(ride.raw_time){
          const [hh='00', mm='00'] = ride.raw_time.split(':');
          hhmmss = `${hh.padStart(2,'0')}:${mm.padStart(2,'0')}:00`;
        } else {
          try{
            const dt = new Date(ride.departure_time);
            const hh = String(dt.getHours()).padStart(2,'0');
            const mm = String(dt.getMinutes()).padStart(2,'0');
            hhmmss = `${hh}:${mm}:00`;
          }catch{ /* ignore */ }
        }
        const legacyDateTime: Record<string, unknown> = {
          user_id: userId,
          from_city: basePayload.departure,
          to_city: basePayload.destination,
          date: yyyyMmDd,
          time: hhmmss,
          price: basePayload.price,
          seats_total: basePayload.seats_total,
          description: basePayload.description,
          options: basePayload.options,
          vehicle_model: basePayload.vehicle_model,
        };
  const r4 = await tryInsert(legacyDateTime);
  if(!r4.error && r4.data) return r4.data;

        // Fallback si departure_time est NOT NULL dans cette variante de schéma
        const msg4 = getErrorMessage(r4.error);
        console.warn('[createRide] legacy date+time failed:', msg4);
        if(notNullColumn(msg4, 'departure_time')){
          // Essai avec departure_time en ISO (timestamptz/timestamp)
          const r4d = await tryInsert({ ...legacyDateTime, departure_time: basePayload.departure_time });
          if(!r4d.error && r4d.data) return r4d.data;
          const msg4d = getErrorMessage(r4d.error);
          console.warn('[createRide] legacy date+time + ISO departure_time failed:', msg4d);
          // Si la colonne est de type TIME, ré-essayer avec HH:MM:SS
          if(/type\s+time/i.test(msg4d) || /invalid input syntax for type time/i.test(msg4d)){
            const r4e = await tryInsert({ ...legacyDateTime, departure_time: hhmmss });
            if(!r4e.error && r4e.data) return r4e.data;
            console.warn('[createRide] legacy date+time + time-only departure_time failed:', getErrorMessage(r4e.error));
          }
        }

        // Fallback si la colonne 'time' n'existe pas
        if(missingColumn(msg4, 'time')){
          const { time, ...legacyDateOnly } = legacyDateTime;
          const r4b = await tryInsert(legacyDateOnly);
          if(!r4b.error && r4b.data) return r4b.data;
          const msg4b = getErrorMessage(r4b.error);
          console.warn('[createRide] legacy date-only failed:', msg4b);
          if(notNullColumn(msg4b, 'departure_time')){
            const r4b2 = await tryInsert({ ...legacyDateOnly, departure_time: basePayload.departure_time });
            if(!r4b2.error && r4b2.data) return r4b2.data;
            // si type time, tenter HH:MM:SS
            if(/type\s+time/i.test(getErrorMessage(r4b2.error)) || /invalid input syntax for type time/i.test(getErrorMessage(r4b2.error))){
              const r4b3 = await tryInsert({ ...legacyDateOnly, departure_time: '00:00:00' });
              if(!r4b3.error && r4b3.data) return r4b3.data;
              console.warn('[createRide] legacy date-only + time-only departure_time failed:', getErrorMessage(r4b3.error));
            }
          }
        }

        // Fallback si le schéma exige 'seats'
        if(missingColumn(msg4, 'seats_total') || notNullColumn(msg4, 'seats')){
          const { seats_total, ...restDateTime } = legacyDateTime as Record<string, unknown>;
          const r4s = await tryInsert({ ...restDateTime, seats: basePayload.seats_total });
          if(!r4s.error && r4s.data) return r4s.data;
          const msg4s = getErrorMessage(r4s.error);
          console.warn('[createRide] legacy date+time seats->seats failed:', msg4s);
          if(notNullColumn(msg4s, 'seats_total')){
            const r4both = await tryInsert({ ...legacyDateTime, seats: basePayload.seats_total });
            if(!r4both.error && r4both.data) return r4both.data;
            console.warn('[createRide] legacy date+time seats + seats_total failed:', getErrorMessage(r4both.error));
          }
        }

        // Fallback si la colonne 'date' n'existe pas mais 'time' oui
        if(missingColumn(msg4, 'date')){
          const legacyTimeOnly: Record<string, unknown> = {
            user_id: userId,
            from_city: basePayload.departure,
            to_city: basePayload.destination,
            time: hhmmss,
            price: basePayload.price,
            seats_total: basePayload.seats_total,
            description: basePayload.description,
            options: basePayload.options,
            vehicle_model: basePayload.vehicle_model,
          };
          const r4c = await tryInsert(legacyTimeOnly);
          if(!r4c.error && r4c.data) return r4c.data;
          const msg4c = getErrorMessage(r4c.error);
          console.warn('[createRide] legacy time-only failed:', msg4c);
          if(notNullColumn(msg4c, 'departure_time')){
            // si la colonne attend timestamptz, fournir ISO; si TIME, fournir HH:MM:SS
            const r4c2 = await tryInsert({ ...legacyTimeOnly, departure_time: basePayload.departure_time });
            if(!r4c2.error && r4c2.data) return r4c2.data;
            if(/type\s+time/i.test(getErrorMessage(r4c2.error)) || /invalid input syntax for type time/i.test(getErrorMessage(r4c2.error))){
              const r4c3 = await tryInsert({ ...legacyTimeOnly, departure_time: hhmmss });
              if(!r4c3.error && r4c3.data) return r4c3.data;
              console.warn('[createRide] legacy time-only + time-only departure_time failed:', getErrorMessage(r4c3.error));
            }
          }
          // Et si le schéma exige 'seats'
          if(missingColumn(msg4c, 'seats_total') || notNullColumn(msg4c, 'seats')){
            const { seats_total, ...legacyTimeOnlyNoSeatsTotal } = legacyTimeOnly as Record<string, unknown>;
            const r4cS = await tryInsert({ ...legacyTimeOnlyNoSeatsTotal, seats: basePayload.seats_total });
            if(!r4cS.error && r4cS.data) return r4cS.data;
            const msg4cs = getErrorMessage(r4cS.error);
            console.warn('[createRide] legacy time-only seats->seats failed:', msg4cs);
            if(notNullColumn(msg4cs, 'seats_total')){
              const r4cBoth = await tryInsert({ ...legacyTimeOnly, seats: basePayload.seats_total });
              if(!r4cBoth.error && r4cBoth.data) return r4cBoth.data;
              console.warn('[createRide] legacy time-only seats + seats_total failed:', getErrorMessage(r4cBoth.error));
            }
          }
        }

        // Rien n'a fonctionné
        throw r4.error || r3.error || error;
      }
    }
  });
}

export interface CreateReservationInput {
  ride_id: string;
  passenger_id: string; // from auth
  seats: number; // default 1
  price_at_booking: number; // current price
  message?: string;
}

export function useReserveRide(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: CreateReservationInput) => {
      // Use RPC to handle credits + reservation atomically
      const { data, error } = await supabase
        .rpc('reserve_ride_with_credits', {
          p_ride_id: r.ride_id,
          p_seats: r.seats,
          p_price: r.price_at_booking,
          p_message: r.message || null,
        })
        .single();
      if(error) throw error;
      return data as { id: string; ride_id: string; passenger_id: string; seats: number; status: string; created_at: string };
    },
    onSuccess: (_data, vars) => {
      // Invalider le cache du trajet pour rafraîchir seats_available
      qc.invalidateQueries({ queryKey: RIDE_KEY(vars.ride_id) });
    }
  });
}
