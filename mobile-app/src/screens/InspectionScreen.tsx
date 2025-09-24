import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useMissions } from '../hooks/useMissions';
import Toast from 'react-native-toast-message';

interface InspectionPhoto {
  id: string;
  uri: string;
  type: 'pickup' | 'delivery';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export const InspectionScreen: React.FC = () => {
  const { user } = useAuth();
  const { data: missions } = useMissions();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  const activeMissions = missions?.filter(m => 
    m.status === 'in_progress' || m.status === 'pending'
  ) || [];

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'accès à l\'appareil photo est nécessaire pour prendre des photos d\'inspection.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (locationStatus !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'accès à la localisation est nécessaire pour géolocaliser les photos.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const takePhoto = async (type: 'pickup' | 'delivery') => {
    if (!selectedMission) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez sélectionner une mission',
      });
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      // Obtenir la localisation
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Prendre la photo
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: InspectionPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          type,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        };

        setPhotos(prev => [...prev, newPhoto]);
        
        Toast.show({
          type: 'success',
          text1: 'Photo prise',
          text2: `Photo ${type === 'pickup' ? 'enlèvement' : 'livraison'} ajoutée`,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message,
      });
    }
  };

  const uploadPhotos = async () => {
    if (!selectedMission || photos.length === 0) return;

    setUploading(true);

    try {
      // Helper pour obtenir une URL signée d'upload depuis l'Edge Function
      const getSignedUpload = async (
        missionId: string,
        folder: 'departure' | 'arrival' | 'receipts' | 'documents',
        filename: string,
        contentType: string
      ) => {
        const { data, error } = await supabase.functions.invoke('issue-mission-photo-url', {
          body: { action: 'upload', missionId, folder, filename, contentType },
        });
        if (error || !data?.token || !data?.path) {
          throw new Error((data as any)?.error || error?.message || 'Échec URL signée');
        }
        return data as { path: string; token: string };
      };

      for (const photo of photos) {
        const folder = photo.type === 'pickup' ? 'departure' : 'arrival';
        const fileName = `inspection_${selectedMission}_${photo.type}_${photo.id}.jpg`;
        const { path, token } = await getSignedUpload(selectedMission, folder, fileName, 'image/jpeg');

        // Lire le fichier puis uploader via l'URL signée
        const response = await fetch(photo.uri);
        const ab = await response.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from('mission-photos')
          .uploadToSignedUrl(path, token, ab, { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;

        // Sauvegarder les métadonnées en base
        await supabase.from('mission_tracking').insert({
          mission_id: selectedMission,
          driver_id: user?.id,
          latitude: photo.location?.latitude || 0,
          longitude: photo.location?.longitude || 0,
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Photos uploadées',
        text2: `${photos.length} photo(s) sauvegardée(s)`,
      });

      setPhotos([]);
      setSelectedMission(null);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur d\'upload',
        text2: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>État des lieux</Text>
        <Text style={styles.subtitle}>
          Prenez des photos géolocalisées pour documenter vos missions
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sélectionner une mission</Text>
        {activeMissions.map((mission) => (
          <TouchableOpacity
            key={mission.id}
            style={[
              styles.missionCard,
              selectedMission === mission.id && styles.selectedMission
            ]}
            onPress={() => setSelectedMission(mission.id)}
          >
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionRef}>Réf: {mission.reference}</Text>
            </View>
            {selectedMission === mission.id && (
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            )}
          </TouchableOpacity>
        ))}

        {activeMissions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune mission active</Text>
          </View>
        )}
      </View>

      {selectedMission && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prendre des photos</Text>
          
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={[styles.photoButton, styles.pickupButton]}
              onPress={() => takePhoto('pickup')}
            >
              <Ionicons name="arrow-up-circle" size={24} color="white" />
              <Text style={styles.photoButtonText}>Photo enlèvement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoButton, styles.deliveryButton]}
              onPress={() => takePhoto('delivery')}
            >
              <Ionicons name="arrow-down-circle" size={24} color="white" />
              <Text style={styles.photoButtonText}>Photo livraison</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {photos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos prises ({photos.length})</Text>
          
          <View style={styles.photosGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <View style={[
                    styles.photoType,
                    photo.type === 'pickup' ? styles.pickupType : styles.deliveryType
                  ]}>
                    <Text style={styles.photoTypeText}>
                      {photo.type === 'pickup' ? 'Enlèvement' : 'Livraison'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => removePhoto(photo.id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadingButton]}
            onPress={uploadPhotos}
            disabled={uploading}
          >
            <Ionicons 
              name={uploading ? "cloud-upload" : "cloud-upload-outline"} 
              size={20} 
              color="white" 
            />
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Upload en cours...' : 'Sauvegarder les photos'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  missionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedMission: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  missionRef: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  pickupButton: {
    backgroundColor: '#10b981',
  },
  deliveryButton: {
    backgroundColor: '#ef4444',
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 4/3,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 8,
  },
  photoType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickupType: {
    backgroundColor: '#10b981',
  },
  deliveryType: {
    backgroundColor: '#ef4444',
  },
  photoTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  removePhoto: {
    alignSelf: 'flex-end',
  },
  uploadButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  uploadingButton: {
    backgroundColor: '#9ca3af',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});