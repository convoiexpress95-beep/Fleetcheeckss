import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';

export const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();

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

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    textColor = '#1f2937',
    iconColor = '#6b7280'
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
        <Ionicons name="chevron-forward" size={20} color="#c4b5fd" />
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
        />
        
        <SettingItem
          icon="location-outline"
          title="Localisation"
          subtitle="Paramètres de géolocalisation"
        />
        
        <SettingItem
          icon="camera-outline"
          title="Appareil photo"
          subtitle="Qualité et stockage des photos"
        />
      </View>

      {/* Données et synchronisation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Données</Text>
        
        <SettingItem
          icon="sync-outline"
          title="Synchronisation"
          subtitle="Synchroniser avec l'application web"
        />
        
        <SettingItem
          icon="cloud-outline"
          title="Stockage"
          subtitle="Gestion des fichiers locaux"
        />
      </View>

      {/* Support et aide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingItem
          icon="help-circle-outline"
          title="Aide"
          subtitle="Guide d'utilisation"
        />
        
        <SettingItem
          icon="mail-outline"
          title="Contact"
          subtitle="Nous contacter"
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
        <Text style={styles.debugText}>Build: {Constants.expoConfig?.runtimeVersion}</Text>
        <Text style={styles.debugText}>Platform: {Constants.platform?.ios ? 'iOS' : 'Android'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
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
    backgroundColor: '#f3f4f6',
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
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    color: '#6b7280',
  },
  debugSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});