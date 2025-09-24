import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  Modal,
  TextInput,
  Switch,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  status: string;
  created_at: string;
  updated_at: string;
  preferences?: UserSettings;
}

interface UserSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  location_sharing: boolean;
  auto_tracking: boolean;
  dark_mode: boolean;
  language: string;
  timezone: string;
}

const ProfileScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // État du profil utilisateur
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    user_id: user?.id || '',
    full_name: '',
    email: '',
    phone: undefined,
    bio: undefined,
    avatar_url: undefined,
    location: undefined,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preferences: {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      location_sharing: true,
      auto_tracking: false,
      dark_mode: true,
      language: 'fr',
      timezone: 'Europe/Paris'
    }
  });

  const [settings, setSettings] = useState<UserSettings>(
    profile.preferences || {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      location_sharing: true,
      auto_tracking: false,
      dark_mode: true,
      language: 'fr',
      timezone: 'Europe/Paris'
    }
  );

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Charger le profil depuis Supabase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
        if (error) throw error;
        if (!cancelled) {
          if (data) {
            setProfile(prev => ({
              ...prev,
              id: data.id,
              user_id: data.user_id,
              full_name: data.full_name || '',
              email: data.email || user.email || '',
              phone: data.phone || undefined,
              bio: data.bio || undefined,
              avatar_url: data.avatar_url || undefined,
              location: data.location || undefined,
              status: data.status || 'active',
              created_at: data.created_at || prev.created_at,
              updated_at: data.updated_at || prev.updated_at,
              preferences: {
                email_notifications: data.email_notifications ?? true,
                push_notifications: data.push_notifications ?? true,
                sms_notifications: data.sms_notifications ?? false,
                location_sharing: data.location_sharing ?? true,
                auto_tracking: data.auto_tracking ?? false,
                dark_mode: data.dark_mode ?? true,
                language: data.language || 'fr',
                timezone: data.timezone || 'Europe/Paris',
              }
            } as any));
          } else {
            // Créer un profil minimal si inexistant
            const payload: any = { user_id: user.id, full_name: user.email?.split('@')[0] || 'Utilisateur', email: user.email || '' };
            const { data: created, error: insErr } = await supabase.from('profiles').insert(payload).select('*').single();
            if (insErr) throw insErr;
            if (!cancelled) {
              setProfile(prev => ({ ...prev, id: created.id, user_id: created.user_id, full_name: created.full_name || '', email: created.email || '' }));
            }
          }
        }
      } catch (e) {
        console.error('[Profile] load error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Gestion upload avatar vers Supabase Storage (bucket: avatars)
  const handleAvatarUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès aux photos pour changer votre avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // NOTE: newer API prefers ImagePicker.MediaType, but to keep compatibility use MediaTypeOptions
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        if (!user?.id) { Alert.alert('Erreur', 'Utilisateur non connecté'); return; }
        const asset = result.assets[0];
        const path = `avatars/${user.id}.jpg`;
        // Transformer l'URI locale en Blob
  const resp = await fetch(asset.uri);
  const ab = await resp.arrayBuffer();
  const { error: upErr } = await supabase.storage.from('avatars').upload(path, ab, { upsert: true, contentType: asset.mimeType || 'image/jpeg' });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
        // Mettre à jour le profil avec l'URL publique
        const { error: upProfErr } = await supabase.from('profiles').update({ avatar_url: pub.publicUrl }).eq('user_id', user.id);
        if (upProfErr) throw upProfErr;
        setProfile(prev => ({ ...prev, avatar_url: pub.publicUrl }));
        Alert.alert('Succès', 'Photo de profil mise à jour');
      } catch (e: any) {
        console.error('[Profile] avatar upload error', e);
        Alert.alert('Erreur', e.message || 'Echec de l\'upload');
      }
    }
  };

  const deleteAvatar = async () => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id) return;
              const key = `avatars/${user.id}.jpg`;
              await supabase.storage.from('avatars').remove([key]);
              await supabase.from('profiles').update({ avatar_url: null }).eq('user_id', user.id);
              setProfile(prev => ({ ...prev, avatar_url: undefined }));
              Alert.alert('Succès', 'Photo de profil supprimée');
            } catch (e: any) {
              Alert.alert('Erreur', e.message || 'Suppression impossible');
            }
          }
        }
      ]
    );
  };

  // Sauvegarder profil (Supabase)
  const saveProfile = async () => {
    try {
      if (!user?.id) { Alert.alert('Erreur', 'Utilisateur non connecté'); return; }
      setLoading(true);
      const payload: any = {
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone ?? null,
        bio: profile.bio ?? null,
        location: profile.location ?? null,
        // Settings à plat si colonnes existent
        email_notifications: profile.preferences?.email_notifications ?? true,
        push_notifications: profile.preferences?.push_notifications ?? true,
        sms_notifications: profile.preferences?.sms_notifications ?? false,
        location_sharing: profile.preferences?.location_sharing ?? true,
        auto_tracking: profile.preferences?.auto_tracking ?? false,
        dark_mode: profile.preferences?.dark_mode ?? true,
        language: profile.preferences?.language ?? 'fr',
        timezone: profile.preferences?.timezone ?? 'Europe/Paris',
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('profiles').update(payload).eq('user_id', user.id);
      if (error) throw error;
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (e: any) {
      console.error('[Profile] save error', e);
      Alert.alert('Erreur', e.message || 'Mise à jour impossible');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder paramètres (local + remote)
  const saveSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...newSettings } as UserSettings
    }));
    // Persister côté base (meilleur effort)
    (async () => {
      try {
        if (!user?.id) return;
        const { error } = await supabase.from('profiles').update({
          email_notifications: ('email_notifications' in newSettings) ? newSettings.email_notifications : undefined,
          push_notifications: ('push_notifications' in newSettings) ? newSettings.push_notifications : undefined,
          sms_notifications: ('sms_notifications' in newSettings) ? newSettings.sms_notifications : undefined,
          location_sharing: ('location_sharing' in newSettings) ? newSettings.location_sharing : undefined,
          auto_tracking: ('auto_tracking' in newSettings) ? newSettings.auto_tracking : undefined,
          dark_mode: ('dark_mode' in newSettings) ? newSettings.dark_mode : undefined,
          language: ('language' in newSettings) ? newSettings.language : undefined,
          timezone: ('timezone' in newSettings) ? newSettings.timezone : undefined,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
        if (error) throw error;
      } catch (e) {
        console.warn('[Profile] settings save best-effort failed', e);
      }
    })();
    Alert.alert('Succès', 'Paramètres sauvegardés');
  };

  // Changer mot de passe
  const changePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwords.new.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    try {
      // Supabase ne supporte pas la vérification du mot de passe actuel côté client.
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      Alert.alert('Succès', 'Mot de passe mis à jour');
      setShowPasswordModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de changer le mot de passe');
    }
  };

  // Supprimer compte
  const deleteAccount = async () => {
    // La suppression de compte nécessite un service role côté serveur (Edge Function/admin)
    Alert.alert('Non disponible', 'Pour supprimer votre compte, contactez le support.');
    setShowDeleteModal(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              👤 Profil
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'security' && styles.activeTab]}
            onPress={() => setActiveTab('security')}
          >
            <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
              🔒 Sécurité
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
              🔔 Notifications
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
            onPress={() => setActiveTab('preferences')}
          >
            <Text style={[styles.tabText, activeTab === 'preferences' && styles.activeTabText]}>
              ⚙️ Préférences
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'profile' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Informations du profil</Text>
                <Text style={styles.sectionSubtitle}>Gérez vos informations personnelles et votre photo de profil</Text>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                  <View style={styles.avatarContainer}>
                    {profile.avatar_url ? (
                      <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{getInitials(profile.full_name)}</Text>
                      </View>
                    )}
                    <TouchableOpacity style={styles.avatarEditButton} onPress={handleAvatarUpload}>
                      <Text style={styles.avatarEditIcon}>📷</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.avatarActions}>
                    <TouchableOpacity style={styles.avatarActionBtn} onPress={handleAvatarUpload}>
                      <Text style={styles.avatarActionText}>📷 Changer photo</Text>
                    </TouchableOpacity>
                    {profile.avatar_url && (
                      <TouchableOpacity style={[styles.avatarActionBtn, styles.deleteBtn]} onPress={deleteAvatar}>
                        <Text style={styles.deleteText}>🗑️ Supprimer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{profile.full_name}</Text>
                    <Text style={styles.userEmail}>{profile.email}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>✅ Compte actif</Text>
                    </View>
                  </View>
                </View>

                {/* Formulaire profil */}
                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Nom complet</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.full_name}
                      onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
                      placeholder="Votre nom complet"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={[styles.input, styles.readOnly]}
                      value={profile.email}
                      editable={false}
                      placeholder="Votre email"
                    />
                    <Text style={styles.helperText}>L'email ne peut pas être modifié</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Téléphone</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.phone}
                      onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                      placeholder="+33 6 12 34 56 78"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Localisation</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.location}
                      onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
                      placeholder="Paris, France"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Biographie</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={profile.bio}
                      onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                      placeholder="Parlez-nous de vous..."
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                    <Text style={styles.saveButtonText}>💾 Sauvegarder les modifications</Text>
                  </TouchableOpacity>
                </View>

                {/* Informations compte */}
                <View style={styles.accountInfo}>
                  <Text style={styles.infoTitle}>📊 Informations du compte</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Membre depuis :</Text>
                    <Text style={styles.infoValue}>{formatDate(profile.created_at)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Dernière mise à jour :</Text>
                    <Text style={styles.infoValue}>{formatDate(profile.updated_at)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Statut du compte :</Text>
                    <Text style={[styles.infoValue, styles.activeStatus]}>✅ {profile.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'security' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔒 Sécurité du compte</Text>
                <Text style={styles.sectionSubtitle}>Gérez la sécurité de votre compte et vos préférences de confidentialité</Text>

                {/* Changement mot de passe */}
                <View style={styles.securityCard}>
                  <Text style={styles.cardTitle}>🔑 Mot de passe</Text>
                  <Text style={styles.cardDescription}>
                    Changez votre mot de passe régulièrement pour sécuriser votre compte
                  </Text>
                  <TouchableOpacity style={styles.securityButton} onPress={() => setShowPasswordModal(true)}>
                    <Text style={styles.securityButtonText}>🔄 Changer le mot de passe</Text>
                  </TouchableOpacity>
                </View>

                {/* Authentification à deux facteurs */}
                <View style={styles.securityCard}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>🔐 Authentification à deux facteurs</Text>
                      <Text style={styles.cardDescription}>
                        Sécurité supplémentaire pour votre compte
                      </Text>
                    </View>
                    <Switch
                      value={false}
                      onValueChange={(value) => {
                        Alert.alert('2FA', value ? '2FA activée' : '2FA désactivée');
                      }}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor={false ? '#6b7280' : '#ffffff'}
                    />
                  </View>
                </View>

                {/* Sessions actives */}
                <View style={styles.securityCard}>
                  <Text style={styles.cardTitle}>📱 Sessions actives</Text>
                  <Text style={styles.cardDescription}>Gérez les appareils connectés à votre compte</Text>
                  
                  <View style={styles.sessionItem}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDevice}>📱 iPhone 13 Pro</Text>
                      <Text style={styles.sessionDetails}>Paris, France • Maintenant</Text>
                    </View>
                    <View style={styles.currentSession}>
                      <Text style={styles.currentSessionText}>Actuelle</Text>
                    </View>
                  </View>

                  <View style={styles.sessionItem}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDevice}>💻 Chrome sur Windows</Text>
                      <Text style={styles.sessionDetails}>Paris, France • Il y a 2 heures</Text>
                    </View>
                    <TouchableOpacity style={styles.revokeButton}>
                      <Text style={styles.revokeButtonText}>❌ Révoquer</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.revokeAllButton}>
                    <Text style={styles.revokeAllText}>🚪 Déconnecter tous les autres appareils</Text>
                  </TouchableOpacity>
                </View>

                {/* Suppression compte */}
                <View style={[styles.securityCard, styles.dangerCard]}>
                  <Text style={styles.dangerTitle}>⚠️ Zone de danger</Text>
                  <Text style={styles.dangerDescription}>
                    Ces actions sont irréversibles. Procédez avec prudence.
                  </Text>
                  <TouchableOpacity 
                    style={styles.dangerButton} 
                    onPress={() => setShowDeleteModal(true)}
                  >
                    <Text style={styles.dangerButtonText}>🗑️ Supprimer le compte</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'notifications' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔔 Notifications</Text>
                <Text style={styles.sectionSubtitle}>Gérez vos préférences de notification</Text>

                {/* Email notifications */}
                <View style={styles.notificationCard}>
                  <View style={styles.notificationHeader}>
                    <View>
                      <Text style={styles.notificationTitle}>📧 Notifications par email</Text>
                      <Text style={styles.notificationDescription}>
                        Recevoir les notifications importantes par email
                      </Text>
                    </View>
                    <Switch
                      value={settings.email_notifications}
                      onValueChange={(value) => saveSettings({ email_notifications: value })}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor={settings.email_notifications ? '#ffffff' : '#6b7280'}
                    />
                  </View>
                </View>

                {/* Push notifications */}
                <View style={styles.notificationCard}>
                  <View style={styles.notificationHeader}>
                    <View>
                      <Text style={styles.notificationTitle}>📲 Notifications push</Text>
                      <Text style={styles.notificationDescription}>
                        Notifications instantanées sur votre appareil
                      </Text>
                    </View>
                    <Switch
                      value={settings.push_notifications}
                      onValueChange={(value) => saveSettings({ push_notifications: value })}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor={settings.push_notifications ? '#ffffff' : '#6b7280'}
                    />
                  </View>
                </View>

                {/* SMS notifications */}
                <View style={styles.notificationCard}>
                  <View style={styles.notificationHeader}>
                    <View>
                      <Text style={styles.notificationTitle}>📱 Notifications SMS</Text>
                      <Text style={styles.notificationDescription}>
                        Recevoir les alertes critiques par SMS
                      </Text>
                    </View>
                    <Switch
                      value={settings.sms_notifications}
                      onValueChange={(value) => saveSettings({ sms_notifications: value })}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor={settings.sms_notifications ? '#ffffff' : '#6b7280'}
                    />
                  </View>
                </View>

                {/* Types de notifications */}
                <View style={styles.notificationTypes}>
                  <Text style={styles.typesTitle}>📋 Types de notifications</Text>
                  
                  <View style={styles.typeItem}>
                    <Text style={styles.typeLabel}>🚛 Missions et livraisons</Text>
                    <Switch
                      value={true}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor='#ffffff'
                    />
                  </View>

                  <View style={styles.typeItem}>
                    <Text style={styles.typeLabel}>🔧 Maintenance véhicules</Text>
                    <Switch
                      value={true}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor='#ffffff'
                    />
                  </View>

                  <View style={styles.typeItem}>
                    <Text style={styles.typeLabel}>💰 Facturation et paiements</Text>
                    <Switch
                      value={false}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor='#6b7280'
                    />
                  </View>

                  <View style={styles.typeItem}>
                    <Text style={styles.typeLabel}>📊 Rapports hebdomadaires</Text>
                    <Switch
                      value={true}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor='#ffffff'
                    />
                  </View>

                  <View style={styles.typeItem}>
                    <Text style={styles.typeLabel}>🎉 Promotions et actualités</Text>
                    <Switch
                      value={false}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor='#6b7280'
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'preferences' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Préférences</Text>
                <Text style={styles.sectionSubtitle}>Personnalisez votre expérience FleetChecks</Text>

                {/* Partage de localisation */}
                <View style={styles.preferenceCard}>
                  <View style={styles.preferenceHeader}>
                    <View>
                      <Text style={styles.preferenceTitle}>📍 Partage de localisation</Text>
                      <Text style={styles.preferenceDescription}>
                        Permettre le suivi de position pour les missions
                      </Text>
                    </View>
                    <Switch
                      value={settings.location_sharing}
                      onValueChange={(value) => saveSettings({ location_sharing: value })}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor={settings.location_sharing ? '#ffffff' : '#6b7280'}
                    />
                  </View>
                </View>

                {/* Suivi automatique */}
                <View style={styles.preferenceCard}>
                  <View style={styles.preferenceHeader}>
                    <View>
                      <Text style={styles.preferenceTitle}>🔄 Suivi automatique</Text>
                      <Text style={styles.preferenceDescription}>
                        Démarrer automatiquement le suivi des missions
                      </Text>
                    </View>
                    <Switch
                      value={settings.auto_tracking}
                      onValueChange={(value) => saveSettings({ auto_tracking: value })}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor={settings.auto_tracking ? '#ffffff' : '#6b7280'}
                    />
                  </View>
                </View>

                {/* Mode sombre */}
                <View style={styles.preferenceCard}>
                  <View style={styles.preferenceHeader}>
                    <View>
                      <Text style={styles.preferenceTitle}>🌙 Mode sombre</Text>
                      <Text style={styles.preferenceDescription}>
                        Interface sombre pour réduire la fatigue oculaire
                      </Text>
                    </View>
                    <Switch
                      value={settings.dark_mode}
                      onValueChange={(value) => saveSettings({ dark_mode: value })}
                      trackColor={{ false: '#374151', true: '#059669' }}
                      thumbColor={settings.dark_mode ? '#ffffff' : '#6b7280'}
                    />
                  </View>
                </View>

                {/* Langue */}
                <View style={styles.preferenceCard}>
                  <Text style={styles.preferenceTitle}>🌐 Langue</Text>
                  <Text style={styles.preferenceDescription}>Choisissez votre langue préférée</Text>
                  <TouchableOpacity style={styles.selectButton}>
                    <Text style={styles.selectValue}>
                      {settings.language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                    </Text>
                    <Text style={styles.selectArrow}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Fuseau horaire */}
                <View style={styles.preferenceCard}>
                  <Text style={styles.preferenceTitle}>🕐 Fuseau horaire</Text>
                  <Text style={styles.preferenceDescription}>Définissez votre fuseau horaire</Text>
                  <TouchableOpacity style={styles.selectButton}>
                    <Text style={styles.selectValue}>{settings.timezone}</Text>
                    <Text style={styles.selectArrow}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Actions sur les données */}
                <View style={styles.dataSection}>
                  <Text style={styles.dataSectionTitle}>💾 Gestion des données</Text>
                  
                  <TouchableOpacity style={styles.dataButton}>
                    <Text style={styles.dataButtonText}>📥 Exporter mes données</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.dataButton}>
                    <Text style={styles.dataButtonText}>🔄 Synchroniser les données</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.dataButton, styles.clearDataButton]}>
                    <Text style={styles.clearDataText}>🗑️ Effacer le cache local</Text>
                  </TouchableOpacity>
                </View>

                {/* Bouton déconnexion */}
                <TouchableOpacity style={styles.logoutButton}>
                  <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Modal changement mot de passe */}
        <Modal visible={showPasswordModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔑 Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.passwordForm}>
                <View style={styles.passwordGroup}>
                  <Text style={styles.label}>Mot de passe actuel</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={passwords.current}
                      onChangeText={(text) => setPasswords(prev => ({ ...prev, current: text }))}
                      placeholder="Mot de passe actuel"
                      secureTextEntry={!showPasswords.current}
                    />
                    <TouchableOpacity 
                      style={styles.passwordToggle}
                      onPress={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      <Text style={styles.passwordToggleText}>
                        {showPasswords.current ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.passwordGroup}>
                  <Text style={styles.label}>Nouveau mot de passe</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={passwords.new}
                      onChangeText={(text) => setPasswords(prev => ({ ...prev, new: text }))}
                      placeholder="Nouveau mot de passe"
                      secureTextEntry={!showPasswords.new}
                    />
                    <TouchableOpacity 
                      style={styles.passwordToggle}
                      onPress={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      <Text style={styles.passwordToggleText}>
                        {showPasswords.new ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.passwordGroup}>
                  <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={passwords.confirm}
                      onChangeText={(text) => setPasswords(prev => ({ ...prev, confirm: text }))}
                      placeholder="Confirmer le nouveau mot de passe"
                      secureTextEntry={!showPasswords.confirm}
                    />
                    <TouchableOpacity 
                      style={styles.passwordToggle}
                      onPress={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      <Text style={styles.passwordToggleText}>
                        {showPasswords.confirm ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>📋 Exigences du mot de passe :</Text>
                  <Text style={styles.requirement}>• Au moins 8 caractères</Text>
                  <Text style={styles.requirement}>• Au moins une lettre majuscule</Text>
                  <Text style={styles.requirement}>• Au moins une lettre minuscule</Text>
                  <Text style={styles.requirement}>• Au moins un chiffre</Text>
                  <Text style={styles.requirement}>• Au moins un caractère spécial</Text>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={changePassword}>
                  <Text style={styles.saveButtonText}>🔄 Changer le mot de passe</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Modal suppression compte */}
        <Modal visible={showDeleteModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚠️ Supprimer le compte</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.deleteWarning}>
                <Text style={styles.warningTitle}>🚨 Attention : Action irréversible</Text>
                <Text style={styles.warningText}>
                  La suppression de votre compte entraînera :
                </Text>
                <Text style={styles.warningItem}>• Suppression de toutes vos données personnelles</Text>
                <Text style={styles.warningItem}>• Perte de l'historique des missions</Text>
                <Text style={styles.warningItem}>• Suppression des rapports et statistiques</Text>
                <Text style={styles.warningItem}>• Annulation de tous les abonnements actifs</Text>

                <Text style={styles.confirmText}>
                  Pour confirmer, tapez "SUPPRIMER" dans le champ ci-dessous :
                </Text>
                
                <TextInput
                  style={styles.confirmInput}
                  placeholder="Tapez SUPPRIMER"
                  autoCapitalize="characters"
                />

                <TouchableOpacity style={styles.finalDeleteButton} onPress={deleteAccount}>
                  <Text style={styles.finalDeleteText}>🗑️ Supprimer définitivement</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    paddingBottom: Platform.OS === 'android' ? 90 : 100, // Espace pour la barre remontée
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#06b6d4',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#06b6d4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#06b6d4',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#06b6d4',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#059669',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  avatarEditIcon: {
    fontSize: 16,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  avatarActionBtn: {
    backgroundColor: '#1e40af',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  avatarActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#dc2626',
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  badgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  readOnly: {
    backgroundColor: '#0f0f0f',
    color: '#6b7280',
  },
  helperText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  accountInfo: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  activeStatus: {
    color: '#10b981',
  },
  securityCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  securityButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDevice: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionDetails: {
    color: '#9ca3af',
    fontSize: 12,
  },
  currentSession: {
    backgroundColor: '#065f46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentSessionText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '600',
  },
  revokeButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  revokeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  revokeAllButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  revokeAllText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  dangerCard: {
    borderColor: '#dc2626',
    backgroundColor: '#450a0a',
  },
  dangerTitle: {
    color: '#fca5a5',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dangerDescription: {
    color: '#fecaca',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTypes: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  typesTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  typeLabel: {
    color: '#d1d5db',
    fontSize: 14,
    flex: 1,
  },
  preferenceCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectArrow: {
    color: '#9ca3af',
    fontSize: 12,
  },
  dataSection: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  dataSectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dataButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dataButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  clearDataButton: {
    backgroundColor: '#dc2626',
  },
  clearDataText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    color: '#9ca3af',
    fontSize: 24,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  passwordForm: {
    marginBottom: 24,
  },
  passwordGroup: {
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    marginRight: 8,
  },
  passwordToggle: {
    backgroundColor: '#374151',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordToggleText: {
    fontSize: 18,
  },
  passwordRequirements: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  requirementsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirement: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  deleteWarning: {
    padding: 16,
  },
  warningTitle: {
    color: '#fca5a5',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  warningText: {
    color: '#fecaca',
    fontSize: 16,
    marginBottom: 12,
  },
  warningItem: {
    color: '#fecaca',
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 8,
  },
  confirmText: {
    color: 'white',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 12,
  },
  confirmInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
    marginBottom: 24,
  },
  finalDeleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  finalDeleteText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfileScreen;