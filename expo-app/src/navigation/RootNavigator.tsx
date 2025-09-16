import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import {
  MissionsListScreen,
  MissionDetailScreen,
  MissionCreateScreen,
  InspectionsListScreen,
  InspectionDetailScreen,
  InspectionCreateScreen,
  RapportsListScreen,
  RapportDetailScreen,
  RapportGenerateScreen,
  BoutiqueScreen
} from '../screens/screens';
import { Text } from 'react-native';

export type MissionsStackParamList = {
  MissionsList: undefined;
  MissionDetail: { id: string } | undefined;
  MissionCreate: undefined;
};
export type InspectionsStackParamList = {
  InspectionsList: undefined;
  InspectionDetail: { id: string } | undefined;
  InspectionCreate: undefined;
};
export type RapportsStackParamList = {
  RapportsList: undefined;
  RapportDetail: { id: string } | undefined;
  RapportGenerate: { inspectionId: string } | undefined;
};

const MissionsStack = createNativeStackNavigator<MissionsStackParamList>();
const InspectionsStack = createNativeStackNavigator<InspectionsStackParamList>();
const RapportsStack = createNativeStackNavigator<RapportsStackParamList>();

function MissionsNavigator() {
  return (
    <MissionsStack.Navigator>
      <MissionsStack.Screen name="MissionsList" component={MissionsListScreen} options={{ title: 'Missions' }} />
      <MissionsStack.Screen name="MissionDetail" component={MissionDetailScreen} options={{ title: 'Détail Mission' }} />
      <MissionsStack.Screen name="MissionCreate" component={MissionCreateScreen} options={{ title: 'Créer Mission' }} />
    </MissionsStack.Navigator>
  );
}
function InspectionsNavigator() {
  return (
    <InspectionsStack.Navigator>
      <InspectionsStack.Screen name="InspectionsList" component={InspectionsListScreen} options={{ title: 'Inspections' }} />
      <InspectionsStack.Screen name="InspectionDetail" component={InspectionDetailScreen} options={{ title: 'Détail Inspection' }} />
      <InspectionsStack.Screen name="InspectionCreate" component={InspectionCreateScreen} options={{ title: 'Créer Inspection' }} />
    </InspectionsStack.Navigator>
  );
}
function RapportsNavigator() {
  return (
    <RapportsStack.Navigator>
      <RapportsStack.Screen name="RapportsList" component={RapportsListScreen} options={{ title: 'Rapports' }} />
      <RapportsStack.Screen name="RapportDetail" component={RapportDetailScreen} options={{ title: 'Détail Rapport' }} />
      <RapportsStack.Screen name="RapportGenerate" component={RapportGenerateScreen} options={{ title: 'Générer Rapport' }} />
    </RapportsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Missions" component={MissionsNavigator} />
        <Tab.Screen name="Inspections" component={InspectionsNavigator} />
        <Tab.Screen name="Rapports" component={RapportsNavigator} />
        <Tab.Screen name="Boutique" component={BoutiqueScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
