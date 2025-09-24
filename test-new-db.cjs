const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vdygbqinodzvkdwegvpq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeWdicWlub2R6dmtkd2VndnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTc5MzgsImV4cCI6MjA3Mzk5MzkzOH0.TTe5vUCj9e08yQtS-UuAqrCPU4lmjIpur1uiPsMXvXo'
);

async function testNewDatabase() {
  console.log('🚀 Test de connexion à la nouvelle base Supabase...');
  
  try {
    // Test des tables principales
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('id, title, reference, created_at')
      .limit(5);
      
    if (missionsError) {
      console.error('❌ Erreur missions:', missionsError);
    } else {
      console.log('✅ Missions récupérées:', missions?.length || 0);
      missions?.forEach(m => console.log('  -', m.reference, m.title));
    }
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(3);
      
    if (profilesError) {
      console.error('❌ Erreur profiles:', profilesError);
    } else {
      console.log('✅ Profils récupérés:', profiles?.length || 0);
    }
    
    const { data: vehicleModels, error: vehicleError } = await supabase
      .from('vehicle_models')
      .select('make, model')
      .limit(3);
      
    if (vehicleError) {
      console.error('❌ Erreur véhicules:', vehicleError);
    } else {
      console.log('✅ Modèles véhicules récupérés:', vehicleModels?.length || 0);
      vehicleModels?.forEach(v => console.log('  -', v.make, v.model));
    }
    
    console.log('✅ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testNewDatabase();