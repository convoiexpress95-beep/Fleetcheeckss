import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';

function screenFactory(name: string) {
  return function GenericScreen() {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-xl font-bold mb-4">{name}</Text>
        <Text className="mb-2 text-neutral-600">Contenu placeholder pour {name}.</Text>
        <Pressable className="bg-blue-600 px-4 py-2 rounded"><Text className="text-white">Action</Text></Pressable>
      </ScrollView>
    );
  };
}
export const MissionsListScreen = screenFactory('Missions - Liste');
export const MissionDetailScreen = screenFactory('Missions - D�tail');
export const MissionCreateScreen = screenFactory('Missions - Cr�ation');
export const InspectionsListScreen = screenFactory('Inspections - Liste');
export const InspectionDetailScreen = screenFactory('Inspections - D�tail');
export const InspectionCreateScreen = screenFactory('Inspections - Cr�ation');
export const RapportsListScreen = screenFactory('Rapports - Liste');
export const RapportDetailScreen = screenFactory('Rapports - D�tail');
export const RapportGenerateScreen = screenFactory('Rapports - G�n�ration');
export const BoutiqueScreen = screenFactory('Boutique');
