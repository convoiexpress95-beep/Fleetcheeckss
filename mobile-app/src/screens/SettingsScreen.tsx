import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';
import { tokens } from '../theme';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MailComposer from 'expo-mail-composer';
import { useLocation } from '../hooks/useLocation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

export const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { requestPermissions: requestLocationPermissions, getCurrentLocation } = useLocation();
  const queryClient = useQueryClient();

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: signOut },
      ]
    );
  };

  // Notifications: demander permissions et envoyer une notif locale de test
  const handleNotifications = async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      let status = settings.status;
      if (status !== 'granted') {
        const req = await Notifications.requestPermissionsAsync();
        status = req.status;
      }
      if (status !== 'granted') {
        Alert.alert(
          'Notifications désactivées',
          'Activez les notifications dans les réglages système.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      // Android: s'assurer qu'un channel existe
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          vibrationPattern: [250, 250, 500],
          lightColor: '#34d399',
        });
      }
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Notifications activées ✅', body: 'Exemple de notification locale.' },
        trigger: null,
      });
      Alert.alert('Notifications', 'Permission accordée et notification test envoyée.');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de configurer les notifications');
    }
  };

  // Localisation: demander permissions et récupérer la position courante
  const handleLocation = async () => {
    const ok = await requestLocationPermissions();
    if (!ok) return;
    const loc = await getCurrentLocation();
    if (loc) {
      Alert.alert('Position actuelle', `Lat: ${loc.latitude.toFixed(5)}\nLng: ${loc.longitude.toFixed(5)}`);
    }
  };

  // Appareil photo: demander permissions (caméra & bibliothèque)
  const handleCamera = async () => {
    try {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cam.status !== 'granted') {
        Alert.alert('Caméra', 'Permission caméra refusée. Ouvrir les réglages ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Réglages', onPress: () => Linking.openSettings() },
        ]);
        return;
      }
      Alert.alert('Appareil photo', `Caméra: ${cam.status} • Bibliothèque: ${lib.status}`);
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de demander les permissions appareil photo');
    }
  };

  // Synchronisation: invalider les caches et rafraîchir la session
  const handleSync = async () => {
    try {
      queryClient.invalidateQueries();
      await supabase.auth.refreshSession();
      Alert.alert('Synchronisation', 'Rafraîchissement lancé. Les données seront rechargées.');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'La synchronisation a échoué');
    }
  };

  // Utilitaires de stockage
  const getDirSize = async (dir: string): Promise<number> => {
    try {
      const entries = await FileSystem.readDirectoryAsync(dir);
      let total = 0;
      for (const name of entries) {
        const path = `${dir}${dir.endsWith('/') ? '' : '/'}${name}`;
        const info: any = await FileSystem.getInfoAsync(path);
        if (info.isDirectory) {
          total += await getDirSize(path);
        } else {
          total += (info.size ?? 0);
        }
      }
      return total;
    } catch {
      return 0;
    }
  };

  const clearCache = async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory || '';
      const entries = await FileSystem.readDirectoryAsync(cacheDir);
      for (const name of entries) {
        const path = `${cacheDir}${cacheDir.endsWith('/') ? '' : '/'}${name}`;
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
      Alert.alert('Stockage', 'Cache nettoyé.');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de nettoyer le cache');
    }
  };

  const handleStorage = async () => {
    const cacheDir = FileSystem.cacheDirectory || '';
    const size = await getDirSize(cacheDir);
    const mb = (size / (1024 * 1024)).toFixed(1);
    Alert.alert(
      'Stockage',
      `Cache actuel: ~${mb} Mo`,
      [
        { text: 'Fermer', style: 'cancel' },
        { text: 'Vider le cache', style: 'destructive', onPress: clearCache },
      ]
    );
  };

  // Aide: ouvrir un lien d’aide
  const handleHelp = async () => {
  const url = 'https://fleetchecks.com/aide';
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
    else Alert.alert('Aide', 'Guide indisponible pour le moment.');
  };

  // Contact: pré-remplir un email de support
  const handleContact = async () => {
    try {
      const available = await MailComposer.isAvailableAsync();
      const subject = 'Support FleetChecks Mobile';
      const body = `Version: ${Constants.expoConfig?.version}\nPlateforme: ${Platform.OS}`;
  const to = ['support@fleetchecks.com'];
      if (available) {
        await MailComposer.composeAsync({ recipients: to, subject, body });
      } else {
        const url = `mailto:${to[0]}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) Linking.openURL(url);
        else Alert.alert('Contact', 'Aucun client mail disponible.');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible d’ouvrir l’email');
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
  textColor = tokens.colors.onSurface,
  iconColor = tokens.colors.onSurface
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    textColor?: string;
    iconColor?: string;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && onPress && (
  <Ionicons name="chevron-forward" size={20} color={tokens.colors.accent} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      {/* Profil utilisateur */}
      <View style={styles.section}>
        <View style={styles.userProfile}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#6b7280" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.email?.split('@')[0]}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Paramètres généraux */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Général</Text>
        
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Gérer vos préférences de notification"
          onPress={handleNotifications}
        />
        
        <SettingItem
          icon="location-outline"
          title="Localisation"
          subtitle="Paramètres de géolocalisation"
          onPress={handleLocation}
        />
        
        <SettingItem
          icon="camera-outline"
          title="Appareil photo"
          subtitle="Qualité et stockage des photos"
          onPress={handleCamera}
        />
      </View>

      {/* Données et synchronisation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Données</Text>
        
        <SettingItem
          icon="sync-outline"
          title="Synchronisation"
          subtitle="Synchroniser avec l'application web"
          onPress={handleSync}
        />
        
        <SettingItem
          icon="cloud-outline"
          title="Stockage"
          subtitle="Gestion des fichiers locaux"
          onPress={handleStorage}
        />
      </View>

      {/* Support et aide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingItem
          icon="help-circle-outline"
          title="Aide"
          subtitle="Guide d'utilisation"
          onPress={handleHelp}
        />
        
        <SettingItem
          icon="mail-outline"
          title="Contact"
          subtitle="Nous contacter"
          onPress={handleContact}
        />
        
        <SettingItem
          icon="information-circle-outline"
          title="À propos"
          subtitle={`Version ${Constants.expoConfig?.version || '1.0.0'}`}
          showArrow={false}
        />
      </View>

      {/* Actions dangereuses */}
      <View style={styles.section}>
        <SettingItem
          icon="log-out-outline"
          title="Déconnexion"
          onPress={handleSignOut}
          textColor="#ef4444"
          iconColor="#ef4444"
        />
      </View>

      {/* Informations de debug */}
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Informations techniques</Text>
        <Text style={styles.debugText}>Version: {Constants.expoConfig?.version}</Text>
  <Text style={styles.debugText}>Build: {String(Constants.expoConfig?.runtimeVersion ?? '')}</Text>
        <Text style={styles.debugText}>Platform: {Constants.platform?.ios ? 'iOS' : 'Android'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: tokens.colors.background,
  },
  header: {
    padding: 20,
  backgroundColor: tokens.colors.card,
    borderBottomWidth: 1,
  borderBottomColor: tokens.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  color: tokens.colors.onSurface,
  },
  section: {
  backgroundColor: tokens.colors.surface,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  color: tokens.colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  backgroundColor: tokens.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  color: tokens.colors.onSurface,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  color: tokens.colors.onSurface,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  borderBottomColor: tokens.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  color: tokens.colors.onSurface,
  },
  debugSection: {
    margin: 16,
    padding: 16,
  backgroundColor: tokens.colors.card,
    borderRadius: 8,
    borderWidth: 1,
  borderColor: tokens.colors.border,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
  color: tokens.colors.onSurface,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
  color: tokens.colors.onSurface,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});