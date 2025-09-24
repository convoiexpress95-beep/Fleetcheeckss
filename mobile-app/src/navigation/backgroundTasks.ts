import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

export const NAV_BG_TASK = 'NAVIGATION_BG_UPDATES';

TaskManager.defineTask(NAV_BG_TASK, async ({ data, error }) => {
  try {
    if (error) return;
    // @ts-ignore
    const { locations } = data || {};
    const loc: Location.LocationObject | undefined = locations?.[0];
    if (!loc) return;
    const missionId = await AsyncStorage.getItem('nav_current_mission_id');
    const userId = await AsyncStorage.getItem('nav_current_user_id');
    if (!missionId || !userId) return;
    const { latitude, longitude, speed } = loc.coords;
    await supabase.from('mission_tracking').insert({ mission_id: missionId, driver_id: userId, latitude, longitude, speed: speed || 0 });
  } catch {}
});
