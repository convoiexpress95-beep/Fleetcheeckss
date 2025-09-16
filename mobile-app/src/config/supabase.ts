import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = "https://lucpsjwaglmiejpfxofe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Y3BzandhZ2xtaWVqcGZ4b2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTA5NzYsImV4cCI6MjA2OTQ2Njk3Nn0.e3sJec_03qxC9C4aHpv-fLQ36wz7c_76xePBv76Ydkc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});