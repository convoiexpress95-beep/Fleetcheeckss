// Script de test pour vérifier les missions dans Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lucpsjwaglmiejpfxofe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Y3BzandhZ2xtaWVqcGZ4b2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTA5NzYsImV4cCI6MjA2OTQ2Njk3Nn0.e3sJec_03qxC9C4aHpv-fLQ36wz7c_76xePBv76Ydkc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMissions() {
  console.log('🔍 Test de connexion Supabase...');
  
  try {
    // Test 1: Récupérer toutes les missions
    console.log('\n📋 Récupération de toutes les missions...');
    const { data: allMissions, error: allError } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Erreur lors de la récupération:', allError);
      return;
    }
    
    console.log(`✅ ${allMissions?.length || 0} missions trouvées`);
    
    if (allMissions && allMissions.length > 0) {
      console.log('\n📝 Première mission:');
      console.log({
        id: allMissions[0].id,
        title: allMissions[0].title,
        reference: allMissions[0].reference,
        created_by: allMissions[0].created_by,
        created_at: allMissions[0].created_at
      });
      
      console.log('\n👥 Types des created_by:');
      allMissions.forEach((mission, index) => {
        console.log(`Mission ${index + 1}: created_by = "${mission.created_by}" (${typeof mission.created_by})`);
      });
    }
    
    // Test 2: Vérifier les colonnes de la table
    console.log('\n🔍 Structure de la table missions:');
    const { data: sampleMission } = await supabase
      .from('missions')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleMission) {
      console.log('Colonnes disponibles:');
      Object.keys(sampleMission).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleMission[key]}`);
      });
    }

    // Test 3: Tentative de création d'une mission test
    console.log('\n🚀 Test de création d\'une mission...');
    
    // D'abord, testons l'authentification anonyme
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Utilisateur authentifié:', user?.id || 'Aucun');
    
    if (authError) {
      console.log('Erreur auth:', authError);
    }

    // Essayons de créer une mission test
    const testMission = {
      title: 'Mission Test Debug',
      reference: `TEST-${Date.now()}`,
      description: 'Mission créée pour tester la base',
      pickup_address: '123 Test Street, Paris',
      delivery_address: '456 Debug Avenue, Lyon',
      pickup_date: new Date().toISOString(),
      pickup_contact_name: 'Test Contact',
      delivery_contact_name: 'Debug Contact',
      license_plate: 'TEST-123',
      created_by: user?.id || '00000000-0000-0000-0000-000000000000', // UUID test si pas d'auth
      donor_earning: 100.0,
    };

    console.log('Payload de test:', testMission);

    const { data: newMission, error: createError } = await supabase
      .from('missions')
      .insert(testMission)
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création mission:', createError);
    } else {
      console.log('✅ Mission créée avec succès:', newMission.id);
      
      // Vérification immédiate
      const { data: checkMission } = await supabase
        .from('missions')
        .select('*')
        .eq('id', newMission.id)
        .single();
      
      console.log('🔍 Vérification mission créée:', checkMission ? 'Trouvée' : 'Non trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testMissions();