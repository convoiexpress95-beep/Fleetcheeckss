import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMissions, useUpdateMissionStatus } from '../hooks/useMissions';
import { Mission } from '../types';

export const MissionsScreen: React.FC = () => {
  const { data: missions, isLoading, refetch } = useMissions();
  const updateMissionStatus = useUpdateMissionStatus();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleStatusUpdate = (missionId: string, newStatus: string) => {
    updateMissionStatus.mutate({ missionId, status: newStatus });
    setModalVisible(false);
  };

  const openMissionDetails = (mission: Mission) => {
    setSelectedMission(mission);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#2563eb';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const renderMissionItem = ({ item: mission }: { item: Mission }) => (
    <TouchableOpacity
      style={styles.missionCard}
      onPress={() => openMissionDetails(mission)}
    >
      <View style={styles.missionHeader}>
        <View style={styles.missionInfo}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionRef}>Réf: {mission.reference}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mission.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(mission.status)}</Text>
        </View>
      </View>

      <View style={styles.missionDetails}>
        {mission.pickup_address && (
          <View style={styles.addressRow}>
            <Ionicons name="arrow-up-circle-outline" size={16} color="#10b981" />
            <Text style={styles.addressText} numberOfLines={1}>
              {mission.pickup_address}
            </Text>
          </View>
        )}
        {mission.delivery_address && (
          <View style={styles.addressRow}>
            <Ionicons name="arrow-down-circle-outline" size={16} color="#ef4444" />
            <Text style={styles.addressText} numberOfLines={1}>
              {mission.delivery_address}
            </Text>
          </View>
        )}
      </View>

      {mission.pickup_date && (
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text style={styles.dateText}>
            {new Date(mission.pickup_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={missions}
        renderItem={renderMissionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune mission assignée</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedMission && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMission.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalRef}>Référence: {selectedMission.reference}</Text>
              
              {selectedMission.description && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.sectionText}>{selectedMission.description}</Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Adresses</Text>
                {selectedMission.pickup_address && (
                  <View style={styles.addressDetail}>
                    <Text style={styles.addressLabel}>Enlèvement</Text>
                    <Text style={styles.addressValue}>{selectedMission.pickup_address}</Text>
                  </View>
                )}
                {selectedMission.delivery_address && (
                  <View style={styles.addressDetail}>
                    <Text style={styles.addressLabel}>Livraison</Text>
                    <Text style={styles.addressValue}>{selectedMission.delivery_address}</Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statut actuel</Text>
                <View style={[styles.currentStatus, { backgroundColor: getStatusColor(selectedMission.status) }]}>
                  <Text style={styles.currentStatusText}>
                    {getStatusLabel(selectedMission.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                {selectedMission.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#2563eb' }]}
                    onPress={() => handleStatusUpdate(selectedMission.id, 'in_progress')}
                  >
                    <Text style={styles.actionButtonText}>Démarrer la mission</Text>
                  </TouchableOpacity>
                )}
                
                {selectedMission.status === 'in_progress' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                    onPress={() => handleStatusUpdate(selectedMission.id, 'completed')}
                  >
                    <Text style={styles.actionButtonText}>Terminer la mission</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
  },
  missionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionInfo: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  missionRef: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  missionDetails: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalRef: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  addressDetail: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  currentStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currentStatusText: {
    color: 'white',
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});