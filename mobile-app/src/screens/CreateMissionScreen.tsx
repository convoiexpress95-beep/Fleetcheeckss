import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
// import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

// Interface pour l'auto-complétion d'adresses (avec Mapbox ou autre service)
interface AddressSuggestion {
  id: string;
  label: string;
  address: string;
  coordinates?: [number, number];
}

export default function CreateMissionScreen({ navigation }: any) {
  const { user, loading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Vérification d'authentification au chargement
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      Alert.alert(
        'Authentification requise', 
        'Vous devez être connecté pour créer une mission. Voulez-vous vous connecter ?',
        [
          { text: 'Annuler', onPress: () => navigation.goBack() },
          { text: 'Se connecter', onPress: () => navigation.navigate('Login') }
        ]
      );
    }
  }, [loading, isAuthenticated, navigation]);

  // Afficher un indicateur de chargement pendant la vérification d'auth
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>Vérification de l'authentification...</Text>
      </SafeAreaView>
    );
  }

  // Ne pas afficher le formulaire si l'utilisateur n'est pas authentifié
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Feather name="lock" size={48} color="#ef4444" />
        <Text style={{ marginTop: 16, fontSize: 18, color: '#374151', textAlign: 'center' }}>
          Authentification requise
        </Text>
        <Text style={{ marginTop: 8, color: '#6b7280', textAlign: 'center', paddingHorizontal: 32 }}>
          Vous devez être connecté pour créer une mission.
        </Text>
        <TouchableOpacity 
          style={[styles.submitBtn, { marginTop: 24 }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.submitText}>Se connecter</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // États du wizard
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // États du formulaire
  const [titre, setTitre] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [modeleVehicule, setModeleVehicule] = useState('');
  const [adresseDepart, setAdresseDepart] = useState('');
  const [adresseArrivee, setAdresseArrivee] = useState('');
  const [contactDepart, setContactDepart] = useState('');
  const [contactArrivee, setContactArrivee] = useState('');
  
  // Séparation date et heure
  const [dateDepart, setDateDepart] = useState(new Date());
  const [heureDepart, setHeureDepart] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  
  // États pour l'auto-complétion
  const [departSuggestions, setDepartSuggestions] = useState<AddressSuggestion[]>([]);
  const [arriveeSuggestions, setArriveeSuggestions] = useState<AddressSuggestion[]>([]);
  const [showDepartSuggestions, setShowDepartSuggestions] = useState(false);
  const [showArriveeSuggestions, setShowArriveeSuggestions] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  // Auto-complétion d'adresses (simulé - à remplacer par Mapbox API)
  const searchAddresses = async (query: string, type: 'depart' | 'arrivee') => {
    if (query.length < 3) {
      if (type === 'depart') {
        setDepartSuggestions([]);
        setShowDepartSuggestions(false);
      } else {
        setArriveeSuggestions([]);
        setShowArriveeSuggestions(false);
      }
      return;
    }

    try {
      // Simulation d'API - remplacer par vraie API Mapbox/Google
      const mockSuggestions: AddressSuggestion[] = [
        { id: '1', label: `${query} - Paris, France`, address: `${query}, Paris, France` },
        { id: '2', label: `${query} - Lyon, France`, address: `${query}, Lyon, France` },
        { id: '3', label: `${query} - Marseille, France`, address: `${query}, Marseille, France` },
      ];

      if (type === 'depart') {
        setDepartSuggestions(mockSuggestions);
        setShowDepartSuggestions(true);
      } else {
        setArriveeSuggestions(mockSuggestions);
        setShowArriveeSuggestions(true);
      }
    } catch (error) {
      console.warn('Erreur auto-complétion:', error);
    }
  };

  const validate = () => {
    if (!titre.trim()) return 'Le titre est requis';
    if (!immatriculation.trim()) return 'L\'immatriculation est requise';
    if (!adresseDepart.trim()) return 'L\'adresse de départ est requise';
    if (!adresseArrivee.trim()) return 'L\'adresse d\'arrivée est requise';
    return null;
  };

  const genReference = () => {
    const ts = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `MIS-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}`;
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatage date et heure séparés
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time: Date): string => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gestion des pickers séparés
  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('DatePicker event:', event?.type, selectedDate);
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate && event?.type !== 'dismissed') {
      setDateDepart(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    console.log('TimePicker event:', event?.type, selectedTime);
    
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime && event?.type !== 'dismissed') {
      setHeureDepart(selectedTime);
    }
  };

  // Navigation du wizard
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1: // Informations de base
        return titre.trim() !== '' && immatriculation.trim() !== '';
      case 2: // Itinéraire
        return adresseDepart.trim() !== '' && adresseArrivee.trim() !== '';
      case 3: // Planning
        return true; // Date et heure ont des valeurs par défaut
      case 4: // Finalisation
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    console.log('[CreateMission] Starting submission...');
    console.log('[CreateMission] User:', user ? { id: user.id, email: user.email } : 'null');
    console.log('[CreateMission] Auth status:', isAuthenticated);
    
    const err = validate();
    if (err) {
      Alert.alert('Champs manquants', err);
      return;
    }
    
    if (!user?.id || !isAuthenticated) {
      console.error('[CreateMission] Authentication failed - user:', user, 'isAuthenticated:', isAuthenticated);
      Alert.alert(
        'Authentification requise', 
        'Vous devez être connecté pour créer une mission. Voulez-vous vous connecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      // Vérifier encore une fois l'état d'authentification Supabase
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !supabaseUser) {
        console.error('[CreateMission] Supabase auth check failed:', authError);
        throw new Error('Session d\'authentification expirée. Veuillez vous reconnecter.');
      }
      
      console.log('[CreateMission] Supabase user confirmed:', supabaseUser.id);
      
      // S'assurer que le profil utilisateur existe avant toute insertion dépendante (évite l'erreur FK 23503)
      try {
        const fullName = (supabaseUser.user_metadata as any)?.full_name || supabaseUser.email || 'Utilisateur';
        const displayName = (supabaseUser.user_metadata as any)?.display_name || (supabaseUser.email?.split('@')[0]) || null;
        const phone = (supabaseUser.user_metadata as any)?.phone || null;
        const avatarUrl = (supabaseUser.user_metadata as any)?.avatar_url || null;

        const { error: ensureErr } = await (supabase as any).rpc('upsert_profile', {
          _user_id: supabaseUser.id,
          _email: supabaseUser.email,
          _full_name: fullName,
          _phone: phone,
          _avatar_url: avatarUrl,
          _display_name: displayName,
          _bio: null,
          _location: null,
        });
        if (ensureErr) {
          console.error('[CreateMission] upsert_profile error:', ensureErr);
          throw new Error("Initialisation du profil requise. Veuillez réessayer ou vous reconnecter.");
        }
        console.log('[CreateMission] Profil utilisateur assuré via RPC upsert_profile');
      } catch (profErr) {
        console.error('[CreateMission] Ensure profile failed:', profErr);
        throw profErr;
      }
      
      // Combiner date et heure
      const combinedDateTime = new Date(dateDepart);
      combinedDateTime.setHours(heureDepart.getHours());
      combinedDateTime.setMinutes(heureDepart.getMinutes());
      
      const payload: any = {
        title: titre.trim(),
        reference: genReference(),
        description: description || null,
        pickup_address: adresseDepart.trim(),
        delivery_address: adresseArrivee.trim(),
        pickup_date: combinedDateTime.toISOString(),
        pickup_contact_name: contactDepart || null,
        delivery_contact_name: contactArrivee || null,
        license_plate: immatriculation.trim(),
        vehicle_model: modeleVehicule || null,
        created_by: supabaseUser.id, // Utiliser l'ID Supabase confirmé
        donor_earning: prix ? parseFloat(prix) : null,
      };

      console.log('[CreateMission] Payload:', { ...payload, created_by: 'USER_ID_HIDDEN' });

      const { data, error } = await supabase.from('missions').insert(payload).select().single();
      
      if (error) {
        console.error('[CreateMission] Insert error:', error);
        throw error;
      }

  console.log('[CreateMission] Mission created successfully:', data.id);
  // Rafraîchir les listes pertinentes
  try {
    await queryClient.invalidateQueries({ queryKey: ['missions'] });
  } catch {}
  try {
    await queryClient.invalidateQueries({ queryKey: ['inspection_missions'] });
  } catch {}
      Alert.alert('Mission créée', `La mission "${data.reference}" a été ajoutée avec succès.`);
      navigation.goBack();
    } catch (e: any) {
      console.error('[CreateMission] Create mission error:', e);
      
      // Messages d'erreur spécifiques
      let errorMessage = "Impossible de créer la mission";
      if (e?.code === '42501') {
        errorMessage = "Erreur d'autorisation. Veuillez vous reconnecter.";
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep > index + 1 && styles.stepCompleted,
            currentStep === index + 1 && styles.stepActive
          ]}>
            {currentStep > index + 1 ? (
              <Feather name="check" size={16} color="white" />
            ) : (
              <Text style={[
                styles.stepNumber,
                currentStep === index + 1 && styles.stepNumberActive
              ]}>
                {index + 1}
              </Text>
            )}
          </View>
          {index < totalSteps - 1 && (
            <View style={[
              styles.stepLine,
              currentStep > index + 1 && styles.stepLineCompleted
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Informations de base</Text>
      <Text style={styles.stepDescription}>Renseignez les détails du véhicule</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Titre de la mission *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Transport BMW X5"
          placeholderTextColor="#9ca3af"
          value={titre}
          onChangeText={setTitre}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Immatriculation *</Text>
          <TextInput
            style={styles.input}
            placeholder="AA-123-BB"
            placeholderTextColor="#9ca3af"
            value={immatriculation}
            onChangeText={setImmatriculation}
            autoCapitalize="characters"
          />
        </View>
        <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Modèle véhicule</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: BMW X5"
            placeholderTextColor="#9ca3af"
            value={modeleVehicule}
            onChangeText={setModeleVehicule}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Itinéraire</Text>
      <Text style={styles.stepDescription}>Définissez le trajet et les contacts</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Adresse de départ *</Text>
        <View style={styles.addressContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ex: 123 rue de la Paix, Paris"
            placeholderTextColor="#9ca3af"
            value={adresseDepart}
            onChangeText={(text) => {
              setAdresseDepart(text);
              searchAddresses(text, 'depart');
            }}
          />
          {showDepartSuggestions && departSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {departSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setAdresseDepart(suggestion.address);
                    setShowDepartSuggestions(false);
                  }}
                >
                  <Feather name="map-pin" size={16} color="#06b6d4" />
                  <Text style={styles.suggestionText}>{suggestion.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Contact départ</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom du contact"
          placeholderTextColor="#9ca3af"
          value={contactDepart}
          onChangeText={setContactDepart}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Adresse d'arrivée *</Text>
        <View style={styles.addressContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ex: 456 avenue des Champs, Lyon"
            placeholderTextColor="#9ca3af"
            value={adresseArrivee}
            onChangeText={(text) => {
              setAdresseArrivee(text);
              searchAddresses(text, 'arrivee');
            }}
          />
          {showArriveeSuggestions && arriveeSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {arriveeSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setAdresseArrivee(suggestion.address);
                    setShowArriveeSuggestions(false);
                  }}
                >
                  <Feather name="map-pin" size={16} color="#06b6d4" />
                  <Text style={styles.suggestionText}>{suggestion.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Contact arrivée</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom du contact"
          placeholderTextColor="#9ca3af"
          value={contactArrivee}
          onChangeText={setContactArrivee}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Planning</Text>
      <Text style={styles.stepDescription}>Planifiez la date et l'heure de départ</Text>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Date de départ</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(dateDepart)}</Text>
            <Feather name="calendar" size={20} color="#06b6d4" />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Heure de départ</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateInput]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateText}>{formatTime(heureDepart)}</Text>
            <Feather name="clock" size={20} color="#06b6d4" />
          </TouchableOpacity>
        </View>
      </View>

      {/* DatePicker pour Android (date) */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateDepart}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* TimePicker pour Android (heure) */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={heureDepart}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* DatePicker pour iOS (date) */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.datePickerButton}
                >
                  <Text style={[styles.datePickerButtonText, styles.confirmButton]}>Confirmer</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateDepart}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePickerSpinner}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* TimePicker pour iOS (heure) */}
      {showTimePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.datePickerButton}
                >
                  <Text style={[styles.datePickerButtonText, styles.confirmButton]}>Confirmer</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={heureDepart}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.datePickerSpinner}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Finalisation</Text>
      <Text style={styles.stepDescription}>Derniers détails et validation</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Prix proposé (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 150"
          placeholderTextColor="#9ca3af"
          value={prix}
          onChangeText={setPrix}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Détails supplémentaires..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Résumé de la mission</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Titre:</Text>
          <Text style={styles.summaryValue}>{titre || '-'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Véhicule:</Text>
          <Text style={styles.summaryValue}>{immatriculation} {modeleVehicule && `(${modeleVehicule})`}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Trajet:</Text>
          <Text style={styles.summaryValue}>{adresseDepart} → {adresseArrivee}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Départ:</Text>
          <Text style={styles.summaryValue}>{formatDate(dateDepart)} à {formatTime(heureDepart)}</Text>
        </View>
        {prix && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Prix:</Text>
            <Text style={styles.summaryValue}>{prix}€</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={20} color="#e5e7eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle mission</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.wizardFooter}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
            <Feather name="arrow-left" size={20} color="#9ca3af" />
            <Text style={styles.prevButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}
        
        <View style={{ flex: 1 }} />
        
        {currentStep < totalSteps ? (
          <TouchableOpacity 
            style={[styles.nextButton, !canProceedToNextStep() && styles.nextButtonDisabled]}
            onPress={nextStep}
            disabled={!canProceedToNextStep()}
          >
            <Text style={styles.nextButtonText}>Suivant</Text>
            <Feather name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !canProceedToNextStep()}
          >
            {submitting && <ActivityIndicator color="white" size="small" />}
            <Text style={styles.submitText}>
              {submitting ? 'Création...' : 'Créer la mission'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Wizard styles
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(20, 29, 47, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.5)',
  },
  stepCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: '#10b981',
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  wizardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(20, 29, 47, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  wizardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  wizardButtonPrevious: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  wizardButtonNext: {
    backgroundColor: '#06b6d4',
  },
  wizardButtonCreate: {
    backgroundColor: '#10b981',
  },
  wizardButtonDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    opacity: 0.5,
  },
  wizardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    marginLeft: 6,
  },
  wizardButtonTextDisabled: {
    color: '#64748b',
  },
  // Summary styles
  summaryCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  // Navigation button styles (legacy)
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    minWidth: 100,
    justifyContent: 'center',
  },
  prevButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    marginLeft: 6,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#06b6d4',
    minWidth: 100,
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    marginLeft: 6,
  },
  // Existing styles
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148,163,184,0.15)'
  },
  headerTitle: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    color: '#9ca3af',
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#e5e7eb',
  },
  addressContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    zIndex: 1001,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    gap: 8,
  },
  suggestionText: {
    color: '#e5e7eb',
    fontSize: 14,
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: '#06b6d4',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    opacity: 0.6,
  },
  submitText: {
    color: 'white',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModal: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  datePickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  datePickerButtonText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  confirmButton: {
    color: '#06b6d4',
    fontWeight: '600',
  },
  datePickerSpinner: {
    backgroundColor: 'transparent',
  },
});
