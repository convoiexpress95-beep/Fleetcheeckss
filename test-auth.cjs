// Script de test avec authentification
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lucpsjwaglmiejpfxofe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Y3BzandhZ2xtaWVqcGZ4b2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTA5NzYsImV4cCI6MjA2OTQ2Njk3Nn0.e3sJec_03qxC9C4aHpv-fLQ36wz7c_76xePBv76Ydkc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWithAuth() {
  console.log('🔐 Test avec authentification...');
  
  try {
    // Créer un compte test ou utiliser un compte existant
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    console.log('\n🚀 Tentative de connexion...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.log('❌ Connexion échouée, tentative d\'inscription...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      if (signUpError) {
        console.error('❌ Inscription échouée:', signUpError.message);
        return;
      }
      
      console.log('✅ Inscription réussie:', signUpData.user?.id);
    } else {
      console.log('✅ Connexion réussie:', signInData.user?.id);
    }
    
    // Vérifier l'utilisateur actuel
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Impossible de récupérer l\'utilisateur:', userError);
      return;
    }
    
    console.log('👤 Utilisateur authentifié:', user.id);
    
    // Maintenant, essayons de créer une mission
    console.log('\n🚀 Création de mission avec utilisateur authentifié...');
    
    const testMission = {
      title: 'Mission Test Authentifié',
      reference: `AUTH-TEST-${Date.now()}`,
      description: 'Mission créée avec utilisateur authentifié',
      pickup_address: '123 Auth Street, Paris',
      delivery_address: '456 Secure Avenue, Lyon',
      pickup_date: new Date().toISOString(),
      pickup_contact_name: 'Auth Contact',
      delivery_contact_name: 'Secure Contact',
      license_plate: 'AUTH-123',
      created_by: user.id, // Utiliser l'ID utilisateur authentifié
      donor_earning: 150.0,
    };

    console.log('Payload:', { ...testMission, created_by: 'USER_ID_HIDDEN' });

    const { data: newMission, error: createError } = await supabase
      .from('missions')
      .insert(testMission)
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création mission:', createError);
    } else {
      console.log('✅ Mission créée avec succès:', newMission.id);
      
      // Vérification : récupérer toutes les missions
      const { data: allMissions, error: fetchError } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('❌ Erreur récupération missions:', fetchError);
      } else {
        console.log(`\n📋 Total missions dans la base: ${allMissions?.length || 0}`);
        if (allMissions && allMissions.length > 0) {
          console.log('🔍 Dernière mission créée:');
          console.log({
            id: allMissions[0].id,
            title: allMissions[0].title,
            reference: allMissions[0].reference,
            created_by: allMissions[0].created_by,
            created_at: allMissions[0].created_at
          });
        }
      }

      // Test : récupérer uniquement les missions de cet utilisateur (comme le fait l'app mobile)
      console.log('\n🔍 Test récupération missions utilisateur spécifique...');
      const { data: userMissions, error: userFetchError } = await supabase
        .from('missions')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (userFetchError) {
        console.error('❌ Erreur récupération missions utilisateur:', userFetchError);
      } else {
        console.log(`✅ Missions de l'utilisateur ${user.id}: ${userMissions?.length || 0}`);
        if (userMissions && userMissions.length > 0) {
          userMissions.forEach((mission, index) => {
            console.log(`  ${index + 1}. ${mission.title} (${mission.reference})`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testWithAuth();