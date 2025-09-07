import React from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, Chip, List, ActivityIndicator, TouchableRipple, useTheme } from 'react-native-paper';
import { useWeeklyMissions, useTopDrivers } from '../hooks/useDashboardAnalytics';
import { useCredits } from '../hooks/useCredits';
import { useBilling } from '../hooks/useBilling';
import { useReports } from '../hooks/useReports';

const StatCard = ({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) => (
  <Card style={{ flex: 1, marginRight: 12 }}>
    <Card.Content>
      <Text variant="labelSmall" style={{ color: '#6b7280' }}>{title}</Text>
      <Text variant="headlineMedium" style={{ marginTop: 4, color: color || undefined }}>{value}</Text>
      {!!subtitle && <Text variant="bodySmall" style={{ marginTop: 4, color: '#6b7280' }}>{subtitle}</Text>}
    </Card.Content>
  </Card>
);

const MiniBarChart = ({ data }: { data: { week: string; missions: number }[] }) => {
  const max = Math.max(1, ...data.map(d => d.missions));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80 }}>
      {data.map((d, i) => (
        <View key={i} style={{ alignItems: 'center', width: `${100 / data.length}%` }}>
          <View style={{ width: 10, height: (d.missions / max) * 70, backgroundColor: '#3b82f6', borderRadius: 4 }} />
        </View>
      ))}
    </View>
  );
};

export const DashboardScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const weekly = useWeeklyMissions();
  const top = useTopDrivers();
  const { balance } = useCredits();
  const { invoices } = useBilling();
  const { data: reports } = useReports();

  const totalThisWeek = weekly.data?.[weekly.data.length - 1]?.missions || 0;
  const completedThisWeek = weekly.data?.[weekly.data.length - 1]?.completed || 0;
  const inProgressThisWeek = weekly.data?.[weekly.data.length - 1]?.inProgress || 0;
  const creditsLeft = balance?.credits_remaining ?? 0;
  const unpaidInvoices = (invoices || []).filter((i) => i.status === 'overdue' || i.status === 'sent').length;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 12 }}>Tableau de bord</Text>

      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <StatCard title="Missions (semaine)" value={totalThisWeek} subtitle="Total créées" />
        <StatCard title="Terminées" value={completedThisWeek} color={theme.colors.primary} />
        <StatCard title="En cours" value={inProgressThisWeek} color={theme.colors.tertiary} />
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <StatCard title="Crédits restants" value={creditsLeft} subtitle="Utilisables" color="#10b981" />
        <StatCard title="Factures à suivre" value={unpaidInvoices} subtitle="Envoyées ou en retard" color="#f59e0b" />
      </View>

      <Card style={{ marginBottom: 12 }}>
        <Card.Title title="Tendance hebdomadaire" subtitle="Missions par semaine" />
        <Card.Content>
          {weekly.isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <MiniBarChart data={(weekly.data || []).map((d: any) => ({ week: d.week, missions: d.missions }))} />
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {(weekly.data || []).slice(-3).map((d: any, i: number) => (
                  <Chip key={i} style={{ marginRight: 8 }} icon="calendar-week">
                    {d.week}: {d.missions}
                  </Chip>
                ))}
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Card.Title title="Derniers rapports" subtitle="Vos 3 rapports les plus récents" />
        <Card.Content>
          {(!reports || reports.length === 0) ? (
            <Text>Aucun rapport pour l’instant.</Text>
          ) : (
            (reports || []).slice(0, 3).map((r: any) => (
              <List.Item
                key={r.id}
                title={r.title}
                description={`${new Date(r.created_at).toLocaleDateString('fr-FR')} • ${r.report_type} • ${r.missions_count} missions`}
                left={(props) => <List.Icon {...props} icon="file-chart" />}
                onPress={() => navigation.navigate('Reports')}
              />
            ))
          )}
        </Card.Content>
        <Card.Actions>
          <TouchableRipple onPress={() => navigation.navigate('Reports')}>
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>Voir tout</Text>
          </TouchableRipple>
        </Card.Actions>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Card.Title title="Top convoyeurs" subtitle="Classement par missions terminées" />
        <Card.Content>
          {top.isLoading ? (
            <ActivityIndicator />
          ) : (top.data || []).length === 0 ? (
            <Text>Aucun convoyeur pour l’instant.</Text>
          ) : (
            (top.data || []).map((d: any, i: number) => (
              <List.Item
                key={i}
                title={`${d.name} — ${d.completedMissions}/${d.totalMissions} terminées`}
                description={`${d.email} • Taux ${d.successRate}%`}
                left={props => <List.Icon {...props} icon="account" />}
                right={props => <Chip>{d.successRate}%</Chip>}
              />
            ))
          )}
        </Card.Content>
      </Card>

      <View style={{ flexDirection: 'row' }}>
        <TouchableRipple onPress={() => navigation.navigate('Missions')} style={{ flex: 1 }}>
          <Card style={{ marginRight: 8 }}>
            <Card.Content>
              <Text variant="titleMedium">Missions</Text>
              <Text variant="bodySmall" style={{ color: '#6b7280' }}>Créer et suivre</Text>
            </Card.Content>
          </Card>
        </TouchableRipple>
        <TouchableRipple onPress={() => navigation.navigate('Reports')} style={{ flex: 1 }}>
          <Card style={{ marginHorizontal: 4 }}>
            <Card.Content>
              <Text variant="titleMedium">Rapports</Text>
              <Text variant="bodySmall" style={{ color: '#6b7280' }}>Générer / consulter</Text>
            </Card.Content>
          </Card>
        </TouchableRipple>
        <TouchableRipple onPress={() => navigation.navigate('Billing')} style={{ flex: 1 }}>
          <Card style={{ marginLeft: 8 }}>
            <Card.Content>
              <Text variant="titleMedium">Facturation</Text>
              <Text variant="bodySmall" style={{ color: '#6b7280' }}>Crédits / factures</Text>
            </Card.Content>
          </Card>
        </TouchableRipple>
      </View>

      <View style={{ marginTop: 12 }}>
        <TouchableRipple onPress={() => navigation.navigate('Reports')}>
          <Card>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#2563eb', fontWeight: '700' }}>Créer un rapport</Text>
              <Text variant="bodySmall" style={{ color: '#6b7280' }}>Choisir le type et la période</Text>
            </Card.Content>
          </Card>
        </TouchableRipple>
      </View>
    </ScrollView>
  );
};
