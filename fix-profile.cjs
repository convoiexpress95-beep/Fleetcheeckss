const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vdygbqinodzvkdwegvpq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeWdicWlub2R6dmtkd2VndnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTc5MzgsImV4cCI6MjA3Mzk5MzkzOH0.TTe5vUCj9e08yQtS-UuAqrCPU4lmjIpur1uiPsMXvXo'
);

async function fixUserProfile() {
  console.log('🔍 Vérification du profil utilisateur...');
  
  const userId = 'e88a2b8b-32bf-4eab-a4c3-e369742c2a66';
  
  // Vérifier si le profil existe
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('❌ Erreur vérification:', checkError);
    return;
  }
  
  if (existingProfile) {
    console.log('✅ Profil existe déjà:', existingProfile.full_name);
    return;
  }
  
  console.log('⚠️ Profil manquant, création avec INSERT direct...');
  
  // Créer le profil directement
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      email: 'mahdi.benamor1994@gmail.com',
      full_name: 'Mahdi Benamor',
      display_name: 'Mahdi',
      app_role: 'convoyeur',
      is_verified: false,
      is_premium: false,
      credits: 0
    })
    .select();
    
  if (createError) {
    console.error('❌ Erreur création profil:', createError);
  } else {
    console.log('✅ Profil créé avec succès:', newProfile[0]);
    
    // Vérifier que le profil existe maintenant
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    console.log('✅ Vérification - Profil créé:', verifyProfile?.full_name);
  }
}

fixUserProfile().catch(console.error);