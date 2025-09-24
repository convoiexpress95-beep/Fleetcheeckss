import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Linking, Image } from 'react-native';
import { SUPABASE_PROJECT_URL } from '../config/supabase';
// Hook Supabase inspections
import { useInspectionMissions } from '../hooks/useInspections';

interface InspectionStats {
  missionsCount: number;
  contactsCount: number;
  completedInspections: number;
  pendingInspections: number;
  weeklyMissions: Array<{
    day: string;
    missions: number;
    inspections: number;
  }>;
  topDrivers: Array<{
    id: string;
    name: string;
    completedMissions: number;
    rating: number;
  }>;
}

interface Mission {
  id: string;
  title: string;
  reference: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  description: string;
  donor_id: string | null;
  driver_id: string | null;
  vehicle: {
    brand: string;
    model: string;
    plate: string;
  };
  departure: {
    address: string;
    city: string;
  };
  arrival: {
    address: string;
    city: string;
  };
  inspections: {
    departure: boolean;
    arrival: boolean;
    gpsTracking: boolean;
  };
}

const { width } = Dimensions.get('window');

export default function InspectionsScreenComplete({ navigation }: any) {
  const { user } = useAuth();
  const { missions: dbMissions, isLoading, error, refetch } = useInspectionMissions();
  const [stats, setStats] = useState<InspectionStats | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'inspections'>('dashboard');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  // Reports state (mobile parity with web)
  const [showArchived, setShowArchived] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [depDetails, setDepDetails] = useState<any | null>(null);
  const [arrDetails, setArrDetails] = useState<any | null>(null);
  const [depPhotos, setDepPhotos] = useState<string[]>([]);
  const [arrPhotos, setArrPhotos] = useState<string[]>([]);
  const [depSigUrl, setDepSigUrl] = useState<string | null>(null);
  const [arrSigUrl, setArrSigUrl] = useState<string | null>(null);

  // Realtime: refetch when missions for this user change
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('inspections-missions-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions', filter: `driver_id=eq.${user.id}` }, () => {
        refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions', filter: `created_by=eq.${user.id}` }, () => {
        refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions', filter: `donor_id=eq.${user.id}` }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  useEffect(() => {
    if (isLoading) { setLoading(true); return; }
    if (error) { setLoading(false); return; }
    // Adapter les missions issues du hook au format local (déjà aligné dans le hook)
    // @ts-ignore - types compatibles
    setMissions(dbMissions as any);
    // Stats simples basées sur données réelles
    const completed = (dbMissions || []).filter((m: any) => m.status === 'completed').length;
    const pending = (dbMissions || []).filter((m: any) => m.status === 'pending').length;
    setStats({
      missionsCount: dbMissions?.length || 0,
      contactsCount: 0,
      completedInspections: completed,
      pendingInspections: pending,
      weeklyMissions: [
        { day: 'Lun', missions: 0, inspections: 0 },
        { day: 'Mar', missions: 0, inspections: 0 },
        { day: 'Mer', missions: 0, inspections: 0 },
        { day: 'Jeu', missions: 0, inspections: 0 },
        { day: 'Ven', missions: 0, inspections: 0 },
        { day: 'Sam', missions: 0, inspections: 0 },
        { day: 'Dim', missions: 0, inspections: 0 },
      ],
      topDrivers: [],
    });
    setLoading(false);
  }, [dbMissions, isLoading, error]);

  const filteredMissions = missions.filter(mission => {
    if (filterStatus === 'all') return true;
    return mission.status === filterStatus;
  });

  // PUBLIC URL builder (same as web normalize)
  const normalizeKey = useCallback((path?: string | null): string | null => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    let key = path.replace(/^\/+/, '');
    key = key.replace(/^https?:\/\/[^/]+\//i, '');
    const pubPrefix = 'storage/v1/object/public/mission-photos/';
    if (key.startsWith(pubPrefix)) key = key.slice(pubPrefix.length);
    if (key.startsWith('mission-photos/')) key = key.slice('mission-photos/'.length);
    return key;
  }, []);

  const publicUrlFor = useCallback((path?: string | null) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const key = normalizeKey(path);
    if (!key) return null;
    const { data } = supabase.storage.from('mission-photos').getPublicUrl(key);
    return data.publicUrl || null;
  }, [normalizeKey]);

  const dataUrlSignatureMaybe = (obj: any): string | null => {
    const cand = obj?.client_signature_data || obj?.client_signature_base64 || obj?.client_signature || null;
    if (!cand || typeof cand !== 'string') return null;
    if (cand.startsWith('data:image')) return cand;
    if (/^[A-Za-z0-9+/=]+$/.test(cand) && cand.length > 100) return `data:image/png;base64,${cand}`;
    return null;
  };

  const fetchReports = useCallback(async () => {
    if (!user?.id) return;
    setReportsLoading(true);
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      const list = (data || []) as any[];
      setReports(list.filter(m => Boolean(m.archived) === Boolean(showArchived)));
    } catch (e) {
      console.error('fetchReports error', e);
    } finally {
      setReportsLoading(false);
    }
  }, [user?.id, showArchived]);

  useEffect(() => {
    if (activeTab === 'inspections') fetchReports();
  }, [activeTab, fetchReports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#06b6d4';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const loadMissionDetails = useCallback(async (m: any) => {
    setViewLoading(true);
    try {
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('*').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('*').eq('mission_id', m.id).maybeSingle(),
      ]);
      setDepDetails(dep || null);
      setArrDetails(arr || null);
      const depP = Array.isArray(dep?.photos) ? (dep?.photos as unknown as string[]) : [];
      const arrP = Array.isArray(arr?.photos) ? (arr?.photos as unknown as string[]) : [];
      setDepPhotos(depP);
      setArrPhotos(arrP);
      const depSig = dataUrlSignatureMaybe(dep) || publicUrlFor(dep?.client_signature_url || null);
      const arrSig = dataUrlSignatureMaybe(arr) || publicUrlFor(arr?.client_signature_url || null);
      setDepSigUrl(depSig);
      setArrSigUrl(arrSig);
    } finally {
      setViewLoading(false);
    }
  }, [publicUrlFor]);

  const openFullReport = async (m: any) => {
    setViewing(m);
    await loadMissionDetails(m);
  };

  const openPhoto = useCallback((path: string) => {
    const project = (supabase as any).rest?.url?.replace(/\/rest\/v1\/?$/, '') || '';
    const pngUrl = project ? `${project}/functions/v1/photo-png?path=${encodeURIComponent(path)}` : (publicUrlFor(path) || '');
    if (pngUrl) Linking.openURL(pngUrl);
  }, [publicUrlFor]);

  const closeFullReport = () => {
    setViewing(null);
    setDepDetails(null);
    setArrDetails(null);
    setDepPhotos([]);
    setArrPhotos([]);
    setDepSigUrl(null);
    setArrSigUrl(null);
  };

  const emailFullReport = async (m: any) => {
    setBusyId(m.id);
    try {
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('photos').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('photos').eq('mission_id', m.id).maybeSingle(),
      ]);
      const depPhotos = Array.isArray(dep?.photos) ? (dep?.photos as unknown as string[]) : [];
      const arrPhotos = Array.isArray(arr?.photos) ? (arr?.photos as unknown as string[]) : [];
      const all = [...depPhotos, ...arrPhotos];
  const links = all.map((p, i) => `Photo ${i + 1}: ${SUPABASE_PROJECT_URL}/functions/v1/photo-png?path=${encodeURIComponent(normalizeKey(p) || p)}`).join('\n');
  const fnUrl = `${SUPABASE_PROJECT_URL}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(m.id)}`;
      const subject = encodeURIComponent(`Rapport de mission ${m.reference || m.id}`);
      const body = encodeURIComponent(`Bonjour,\n\nRapport: ${m.reference || m.id} – ${m.title || ''}\nPDF (bundle photos): ${fnUrl}\n\nLiens photos:\n${links}\n\nCordialement`);
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
      await Linking.openURL(mailtoUrl);
    } catch (e) {
      console.error('emailFullReport error', e);
    } finally { setBusyId(null); }
  };

  const emailFullReportGmail = async (m: any) => {
    setBusyId(m.id);
    try {
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('photos').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('photos').eq('mission_id', m.id).maybeSingle(),
      ]);
      const depPhotos = Array.isArray(dep?.photos) ? (dep?.photos as unknown as string[]) : [];
      const arrPhotos = Array.isArray(arr?.photos) ? (arr?.photos as unknown as string[]) : [];
      const all = [...depPhotos, ...arrPhotos];
  const encodedLinks = all.map((p, i) => `Photo ${i + 1}: ${SUPABASE_PROJECT_URL}/functions/v1/photo-png?path=${encodeURIComponent(normalizeKey(p) || p)}`).join('%0A');
      const fnUrl = `${SUPABASE_PROJECT_URL}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(m.id)}`;
      const subject = encodeURIComponent(`Rapport de mission ${m.reference || m.id}`);
      const bodyPrefix = encodeURIComponent(`Bonjour,\n\nRapport: ${m.reference || m.id} – ${m.title || ''}\nPDF (bundle photos): ${fnUrl}\n\nLiens photos:\n`);
      const bodySuffix = encodeURIComponent(`\n\nCordialement`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${bodyPrefix}${encodedLinks}${bodySuffix}`;
      await Linking.openURL(gmailUrl);
    } catch (e) {
      console.error('emailFullReportGmail error', e);
    } finally { setBusyId(null); }
  };

  const toggleArchive = async (m: any, value: boolean) => {
    setBusyId(m.id);
    try {
      const { error } = await supabase.from('missions').update({ archived: value } as any).eq('id', m.id);
      if (error) throw error;
      await fetchReports();
    } catch (e) {
      console.error('toggleArchive error', e);
    } finally { setBusyId(null); }
  };

  const handleCreateMission = () => {
    // Ouvre l'écran de création avec le même formulaire que le web
    navigation.navigate('CreateMission');
  };

  const handleViewMission = (mission: Mission) => {
    // Ouvrir le wizard d'inspection côté mobile
    navigation.navigate('MissionWizard', {
      missionId: mission.id,
      title: mission.title,
      reference: mission.reference,
      pickup_address: mission.departure?.address,
      delivery_address: mission.arrival?.address,
    });
  };

  const handleAssignMission = (mission: Mission) => {
    // TODO: Implémenter l'assignation de mission
    // Ouvrir un modal avec liste des chauffeurs disponibles
    Alert.alert(
      'Assigner la mission',
      `Voulez-vous assigner la mission ${mission.reference} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Assigner', onPress: () => {
          // Logique d'assignation ici
          console.log('Assigning mission:', mission.id);
        }}
      ]
    );
  };

  const handleDownloadPDF = async (mission: Mission) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-mission-summary', {
        body: {
          missionId: mission.id,
          action: 'download'
        }
      });

      if (error) {
        console.error('Error generating PDF:', error);
        Alert.alert('Erreur', 'Impossible de générer le PDF');
        return;
      }

      // Pour le moment, on informe juste l'utilisateur
      Alert.alert(
        'PDF généré',
        `Le résumé PDF de la mission ${mission.reference} a été généré avec succès.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le PDF');
    }
  };

  const handlePreviewMission = async (mission: Mission) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-mission-summary', {
        body: {
          missionId: mission.id,
          action: 'preview'
        }
      });

      if (error) {
        console.error('Error generating preview:', error);
        Alert.alert('Erreur', 'Impossible de générer l\'aperçu');
        return;
      }

      // Afficher les détails de la mission
      const statusLabel = getStatusLabel(mission.status);
      const createdDate = new Date(mission.created_at).toLocaleDateString('fr-FR');
      
      Alert.alert(
        'Aperçu de la mission',
        `📋 ${mission.title}
📦 Réf: ${mission.reference}
📍 ${mission.departure.city} → ${mission.arrival.city}
🚗 ${mission.vehicle.brand} ${mission.vehicle.model}
📅 Créée le ${createdDate}
📊 Statut: ${statusLabel}

✅ PDF généré avec succès`,
        [{ text: 'Fermer' }]
      );
    } catch (error) {
      console.error('Error previewing mission:', error);
      Alert.alert('Erreur', 'Impossible de générer l\'aperçu');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Chargement des inspections...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Inspections</Text>
          <Text style={styles.headerSubtitle}>Gestionnaire de missions FleetCheck</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerAction}
          onPress={handleCreateMission}
        >
          <Feather name="plus" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Tabs Navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <MaterialCommunityIcons 
            name="view-dashboard" 
            size={16} 
            color={activeTab === 'dashboard' ? '#06b6d4' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Tableau de bord
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'missions' && styles.activeTab]}
          onPress={() => setActiveTab('missions')}
        >
          <Feather 
            name="truck" 
            size={16} 
            color={activeTab === 'missions' ? '#06b6d4' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'missions' && styles.activeTabText]}>
            Missions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inspections' && styles.activeTab]}
          onPress={() => setActiveTab('inspections')}
        >
          <MaterialCommunityIcons 
            name="clipboard-check" 
            size={16} 
            color={activeTab === 'inspections' ? '#06b6d4' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'inspections' && styles.activeTabText]}>
            Rapports
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="truck" size={24} color="#06b6d4" />
                  <Text style={styles.statValue}>{stats?.missionsCount || 0}</Text>
                  <Text style={styles.statLabel}>Missions</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#10b981" />
                  <Text style={styles.statValue}>{stats?.contactsCount || 0}</Text>
                  <Text style={styles.statLabel}>Contacts</Text>
                </View>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="clipboard-check" size={24} color="#f59e0b" />
                  <Text style={styles.statValue}>{stats?.completedInspections || 0}</Text>
                  <Text style={styles.statLabel}>Inspections OK</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="clipboard-alert" size={24} color="#ef4444" />
                  <Text style={styles.statValue}>{stats?.pendingInspections || 0}</Text>
                  <Text style={styles.statLabel}>En attente</Text>
                </View>
              </View>
            </View>

            {/* Weekly Chart */}
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Activité hebdomadaire</Text>
                <Text style={styles.chartSubtitle}>Missions et inspections</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chartData}>
                  {stats?.weeklyMissions.map((item, index) => (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.barContainer}>
                        <View 
                          style={[
                            styles.bar, 
                            { height: (item.missions / 15) * 80, backgroundColor: '#06b6d4' }
                          ]} 
                        />
                        <View 
                          style={[
                            styles.bar, 
                            { height: (item.inspections / 20) * 80, backgroundColor: '#10b981', marginLeft: 4 }
                          ]} 
                        />
                      </View>
                      <Text style={styles.barLabel}>{item.day}</Text>
                      <Text style={styles.barValue}>{item.missions}M</Text>
                      <Text style={styles.barValue}>{item.inspections}I</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Top Drivers */}
            <View style={styles.driversContainer}>
              <Text style={styles.driversTitle}>Meilleurs convoyeurs</Text>
              {stats?.topDrivers.map((driver, index) => (
                <View key={driver.id} style={styles.driverCard}>
                  <View style={styles.driverRank}>
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                  </View>
                  
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverInitials}>
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <View style={styles.driverStats}>
                      <Text style={styles.driverMissions}>
                        {driver.completedMissions} missions
                      </Text>
                      <View style={styles.driverRating}>
                        <Feather name="star" size={12} color="#f59e0b" />
                        <Text style={styles.ratingText}>{driver.rating}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'missions' && (
          <>
            {/* Filter Bar */}
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
                  onPress={() => setFilterStatus('all')}
                >
                  <Text style={[styles.filterText, filterStatus === 'all' && styles.activeFilterText]}>
                    Toutes ({missions.length})
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, filterStatus === 'pending' && styles.activeFilter]}
                  onPress={() => setFilterStatus('pending')}
                >
                  <Text style={[styles.filterText, filterStatus === 'pending' && styles.activeFilterText]}>
                    En attente ({missions.filter(m => m.status === 'pending').length})
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, filterStatus === 'in_progress' && styles.activeFilter]}
                  onPress={() => setFilterStatus('in_progress')}
                >
                  <Text style={[styles.filterText, filterStatus === 'in_progress' && styles.activeFilterText]}>
                    En cours ({missions.filter(m => m.status === 'in_progress').length})
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, filterStatus === 'completed' && styles.activeFilter]}
                  onPress={() => setFilterStatus('completed')}
                >
                  <Text style={[styles.filterText, filterStatus === 'completed' && styles.activeFilterText]}>
                    Terminées ({missions.filter(m => m.status === 'completed').length})
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Missions List */}
            <View style={styles.missionsList}>
              {filteredMissions.map((mission) => (
                <TouchableOpacity 
                  key={mission.id} 
                  style={styles.missionCard}
                  onPress={() => handleViewMission(mission)}
                >
                  <View style={styles.missionHeader}>
                    <View style={styles.missionTitleContainer}>
                      <Text style={styles.missionTitle}>{mission.title}</Text>
                      <Text style={styles.missionReference}>{mission.reference}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(mission.status)}20` }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(mission.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(mission.status) }]}>
                        {getStatusLabel(mission.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.missionRoute}>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
                      <Text style={styles.routeText}>{mission.departure.city}</Text>
                    </View>
                    <View style={styles.routeArrow}>
                      <Feather name="arrow-right" size={14} color="#9ca3af" />
                    </View>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
                      <Text style={styles.routeText}>{mission.arrival.city}</Text>
                    </View>
                  </View>

                  <View style={styles.missionDetails}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="car" size={14} color="#9ca3af" />
                      <Text style={styles.detailText}>
                        {mission.vehicle.brand} {mission.vehicle.model}
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Feather name="calendar" size={14} color="#9ca3af" />
                      <Text style={styles.detailText}>
                        {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.inspectionFlags}>
                    {mission.inspections.departure && (
                      <View style={styles.inspectionFlag}>
                        <MaterialCommunityIcons name="clipboard-check" size={12} color="#10b981" />
                        <Text style={styles.flagText}>Départ</Text>
                      </View>
                    )}
                    {mission.inspections.arrival && (
                      <View style={styles.inspectionFlag}>
                        <MaterialCommunityIcons name="clipboard-check" size={12} color="#f59e0b" />
                        <Text style={styles.flagText}>Arrivée</Text>
                      </View>
                    )}
                    {mission.inspections.gpsTracking && (
                      <View style={styles.inspectionFlag}>
                        <MaterialCommunityIcons name="map-marker" size={12} color="#06b6d4" />
                        <Text style={styles.flagText}>GPS</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.missionActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#06b6d4', borderColor: 'transparent' }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('MissionWizard', {
                          missionId: mission.id,
                          title: mission.title,
                          reference: mission.reference,
                          pickup_address: mission.departure?.address,
                          delivery_address: mission.arrival?.address,
                          initialStep: 'departure',
                        });
                      }}
                    >
                      <MaterialCommunityIcons name="play" size={16} color="#ffffff" />
                      <Text style={[styles.actionButtonText, { color: '#ffffff', fontWeight: '700' }]}>Démarrer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAssignMission(mission);
                      }}
                    >
                      <MaterialCommunityIcons name="account-plus" size={16} color="#6366f1" />
                      <Text style={styles.actionButtonText}>Assigner</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(mission);
                      }}
                    >
                      <MaterialCommunityIcons name="download" size={16} color="#059669" />
                      <Text style={styles.actionButtonText}>PDF</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handlePreviewMission(mission);
                      }}
                    >
                      <MaterialCommunityIcons name="eye" size={16} color="#0891b2" />
                      <Text style={styles.actionButtonText}>Voir</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              {filteredMissions.length === 0 && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="clipboard-text" size={48} color="#6b7280" />
                  <Text style={styles.emptyTitle}>Aucune mission</Text>
                  <Text style={styles.emptyDescription}>
                    {filterStatus === 'all' 
                      ? 'Aucune mission trouvée'
                      : `Aucune mission "${getStatusLabel(filterStatus)}"`
                    }
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === 'inspections' && (
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Rapports</Text>
              <TouchableOpacity onPress={() => setShowArchived(s => !s)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(6,182,212,0.5)', backgroundColor: showArchived ? 'rgba(6,182,212,0.2)' : 'transparent' }}>
                <Text style={{ color: '#06b6d4' }}>{showArchived ? 'Voir actifs' : 'Voir archivés'}</Text>
              </TouchableOpacity>
            </View>

            {reportsLoading ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator color="#06b6d4" />
                <Text style={{ color: '#9ca3af', marginTop: 8 }}>Chargement…</Text>
              </View>
            ) : reports.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <MaterialCommunityIcons name="file-document-outline" size={40} color="#6b7280" />
                <Text style={{ color: '#9ca3af', marginTop: 8 }}>Aucun rapport</Text>
              </View>
            ) : (
              <View>
                {reports.map(m => (
                  <View key={m.id} style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(55,65,81,0.5)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={{ color: 'white', fontWeight: '600' }} numberOfLines={1}>{m.title || 'Mission'}</Text>
                        <Text style={{ color: '#9ca3af' }} numberOfLines={1}>Réf: {m.reference}</Text>
                        <Text style={{ color: '#9ca3af' }} numberOfLines={1}>{m.pickup_address || '-'} → {m.delivery_address || '-'}</Text>
                      </View>
                      <TouchableOpacity onPress={() => openFullReport(m)} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(8,145,178,0.6)', backgroundColor: 'rgba(8,145,178,0.2)' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialCommunityIcons name="eye" size={16} color="#0891b2" />
                          <Text style={{ color: '#0891b2', marginLeft: 6, fontWeight: '600' }}>Voir</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
                      <TouchableOpacity disabled={busyId===m.id} onPress={() => emailFullReport(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#0e7490', alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>Email</Text>
                      </TouchableOpacity>
                      <TouchableOpacity disabled={busyId===m.id} onPress={() => emailFullReportGmail(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(55,65,81,0.5)', alignItems: 'center' }}>
                        <Text style={{ color: '#e5e7eb', fontWeight: '600' }}>Gmail</Text>
                      </TouchableOpacity>
                      <TouchableOpacity disabled={busyId===m.id} onPress={() => toggleArchive(m, !m.archived)} style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(55,65,81,0.5)' }}>
                        <Text style={{ color: '#e5e7eb', fontWeight: '600' }}>{m.archived ? 'Désarchiver' : 'Archiver'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Full report modal-like card */}
            {viewing && (
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 }}>
                <View style={{ backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', maxHeight: '80%', }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(55,65,81,0.6)' }}>
                    <Text style={{ color: '#e5e7eb', fontWeight: '700' }}>Rapport complet</Text>
                    <TouchableOpacity onPress={closeFullReport}>
                      <MaterialCommunityIcons name="close" size={22} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                  {viewLoading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <ActivityIndicator color="#06b6d4" />
                      <Text style={{ color: '#9ca3af', marginTop: 8 }}>Chargement…</Text>
                    </View>
                  ) : (
                    <ScrollView style={{ padding: 12 }}>
                      <View style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', marginBottom: 8 }}>
                        <Text style={{ color: '#e5e7eb', fontWeight: '700' }}>{viewing.title}</Text>
                        <Text style={{ color: '#9ca3af' }}>Réf: {viewing.reference}</Text>
                        <Text style={{ color: '#9ca3af' }}>De: {viewing.pickup_address || '-'}</Text>
                        <Text style={{ color: '#9ca3af' }}>À: {viewing.delivery_address || '-'}</Text>
                      </View>
                      <View style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', marginBottom: 8 }}>
                        <Text style={{ color: '#06b6d4', fontWeight: '700', marginBottom: 6 }}>Départ</Text>
                        <Text style={{ color: '#9ca3af' }}>Kilométrage: {depDetails?.initial_mileage ?? '-'}</Text>
                        <Text style={{ color: '#9ca3af' }}>% Carburant: {depDetails?.fuel_percent ?? '-'}</Text>
                        <Text style={{ color: '#9ca3af' }}>Clés: {depDetails?.keys_count != null ? (depDetails?.keys_count === 2 ? '2+' : String(depDetails?.keys_count)) : '-'}</Text>
                        <Text style={{ color: '#9ca3af' }}>Carte carburant: {depDetails?.has_fuel_card ? 'Oui' : 'Non'}</Text>
                        <Text style={{ color: '#9ca3af' }}>Docs de bord: {depDetails?.has_board_documents ? 'Oui' : 'Non'}</Text>
                        <Text style={{ color: '#9ca3af' }}>PV de livraison: {depDetails?.has_delivery_report ? 'Oui' : 'Non'}</Text>
                        <Text style={{ color: '#9ca3af' }}>Email client: {depDetails?.client_email ?? '-'}</Text>
                        <Text style={{ color: '#9ca3af' }}>Notes internes: {depDetails?.internal_notes ?? '-'}</Text>
                      </View>
                      <View style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', marginBottom: 8 }}>
                        <Text style={{ color: '#06b6d4', fontWeight: '700', marginBottom: 6 }}>Arrivée</Text>
                        <Text style={{ color: '#9ca3af' }}>Kilométrage: {arrDetails?.final_mileage ?? '-'}</Text>
                        <Text style={{ color: '#9ca3af' }}>Carburant: {arrDetails?.final_fuel ?? '-'}</Text>
                        <Text style={{ color: '#9ca3af' }}>Notes conducteur: {arrDetails?.driver_notes ?? '-'}</Text>
                        <Text style={{ color: '#9ca3af' }}>Notes client: {arrDetails?.client_notes ?? '-'}</Text>
                      </View>
                      <View style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', marginBottom: 8 }}>
                        <Text style={{ color: '#06b6d4', fontWeight: '700', marginBottom: 6 }}>Signatures</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ width: 200, height: 140, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                              <Text style={{ color: '#9ca3af', marginBottom: 6 }}>Départ</Text>
                              {depSigUrl ? (
                                <Image source={{ uri: depSigUrl }} style={{ width: 180, height: 100, resizeMode: 'contain' }} />
                              ) : (
                                <Text style={{ color: '#6b7280' }}>(Aucune)</Text>
                              )}
                            </View>
                            <View style={{ width: 200, height: 140, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                              <Text style={{ color: '#9ca3af', marginBottom: 6 }}>Arrivée</Text>
                              {arrSigUrl ? (
                                <Image source={{ uri: arrSigUrl }} style={{ width: 180, height: 100, resizeMode: 'contain' }} />
                              ) : (
                                <Text style={{ color: '#6b7280' }}>(Aucune)</Text>
                              )}
                            </View>
                          </View>
                        </ScrollView>
                      </View>
                      <View style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', marginBottom: 8 }}>
                        <Text style={{ color: '#06b6d4', fontWeight: '700', marginBottom: 6 }}>Photos départ</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            {depPhotos.length === 0 ? (
                              <Text style={{ color: '#6b7280' }}>(Aucune)</Text>
                            ) : depPhotos.map((p, idx) => (
                              <TouchableOpacity key={`dep-${idx}`} onPress={() => openPhoto(p)} style={{ width: 120, height: 90, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', overflow: 'hidden' }}>
                                <Image source={{ uri: publicUrlFor(p) || undefined }} style={{ width: '100%', height: '100%' }} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                      <View style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', marginBottom: 8 }}>
                        <Text style={{ color: '#06b6d4', fontWeight: '700', marginBottom: 6 }}>Photos arrivée</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            {arrPhotos.length === 0 ? (
                              <Text style={{ color: '#6b7280' }}>(Aucune)</Text>
                            ) : arrPhotos.map((p, idx) => (
                              <TouchableOpacity key={`arr-${idx}`} onPress={() => openPhoto(p)} style={{ width: 120, height: 90, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', overflow: 'hidden' }}>
                                <Image source={{ uri: publicUrlFor(p) || undefined }} style={{ width: '100%', height: '100%' }} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    </ScrollView>
                  )}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Création de mission: remplacé par l'écran CreateMission */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#d1d5db',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    backgroundColor: '#1e293b',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  headerAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#06b6d4',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  chartData: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  chartBar: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 40,
  },
  barContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  barValue: {
    color: '#9ca3af',
    fontSize: 9,
  },
  driversContainer: {
    margin: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  driversTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  driverRank: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverMissions: {
    color: '#9ca3af',
    fontSize: 12,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  activeFilter: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  filterText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#06b6d4',
  },
  missionsList: {
    paddingHorizontal: 16,
  },
  missionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  missionReference: {
    color: '#9ca3af',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  missionRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  routeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  routeArrow: {
    marginHorizontal: 12,
  },
  missionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  inspectionFlags: {
    flexDirection: 'row',
    gap: 8,
  },
  inspectionFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  flagText: {
    color: '#d1d5db',
    fontSize: 10,
    fontWeight: '500',
  },
  missionActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  inspectionsContent: {
    padding: 16,
  },
  inspectionStats: {
    gap: 16,
  },
  inspectionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reportTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reportDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 12,
  },
  reportButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  reportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'white',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  checkboxText: {
    color: '#d1d5db',
    fontSize: 14,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.5)',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    flex: 2,
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});