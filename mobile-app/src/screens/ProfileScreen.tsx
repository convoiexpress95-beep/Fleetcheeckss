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
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // État du profil utilisateur
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    user_id: 'user-123',
    full_name: 'Pierre Martin',
    email: 'pierre.martin@fleetchecks.fr',
    phone: '+33 6 12 34 56 78',
    bio: 'Gestionnaire de flotte expérimenté avec plus de 10 ans d\'expérience dans l\'optimisation logistique et la gestion d\'équipes. Passionné par l\'innovation et les nouvelles technologies.',
    avatar_url: undefined,
    location: 'Paris, France',
    status: 'active',
    created_at: '2021-03-15T10:00:00Z',
    updated_at: '2025-01-18T14:30:00Z',
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

  // Gestion upload avatar
  const handleAvatarUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès aux photos pour changer votre avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfile(prev => ({
        ...prev,
        avatar_url: result.assets[0].uri
      }));
      Alert.alert('Succès', 'Photo de profil mise à jour');
    }
  };

  const deleteAvatar = () => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setProfile(prev => ({ ...prev, avatar_url: undefined }));
            Alert.alert('Succès', 'Photo de profil supprimée');
          }
        }
      ]
    );
  };

  // Sauvegarder profil
  const saveProfile = () => {
    Alert.alert('Succès', 'Profil mis à jour avec succès');
  };

  // Sauvegarder paramètres
  const saveSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...newSettings } as UserSettings
    }));
    Alert.alert('Succès', 'Paramètres sauvegardés');
  };

  // Changer mot de passe
  const changePassword = () => {
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

    Alert.alert('Succès', 'Mot de passe mis à jour');
    setShowPasswordModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  // Supprimer compte
  const deleteAccount = () => {
    Alert.alert('Compte supprimé', 'Votre compte a été supprimé définitivement');
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