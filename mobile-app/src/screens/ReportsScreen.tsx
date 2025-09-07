import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal, Image, FlatList } from 'react-native';
import { useReports, useGenerateReport, useDeleteReport, Report } from '../hooks/useReports';
import { getPublicUrlForMissionPhoto, normalizePhotoList } from '../utils/storage';

const ReportsScreen: React.FC = () => {
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [selectedReport, setSelectedReport] = useState<Report | null>(null);
	const [viewerOpen, setViewerOpen] = useState(false);

	const { data: reports = [], isLoading } = useReports(dateFrom, dateTo);
	const generateReport = useGenerateReport();
	const deleteReport = useDeleteReport();

	const formatCurrency = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);
	const statusLabel = (s: Report['status']) => ({ available: 'Disponible', generated: 'Généré', processing: 'En cours' }[s] || s);
	const typeLabel = (t: Report['report_type']) => ({ complete: 'Complet', financial: 'Financier', mileage: 'Kilométrage', inspection: 'Inspection' }[t] || t);

	const handleGenerate = async (type: Report['report_type']) => {
		if (!dateFrom || !dateTo) return;
		await generateReport.mutateAsync({ report_type: type, date_from: dateFrom, date_to: dateTo });
	};

	const openViewer = (r: Report) => { setSelectedReport(r); setViewerOpen(true); };

		return (
			<View style={styles.container}>
				<FlatList
					data={reports}
					keyExtractor={(r) => r.id}
					contentContainerStyle={{ padding: 16, gap: 8 }}
					ListHeaderComponent={( 
						<View>
							<Text style={styles.title}>Rapports & Analytics</Text>

							{/* Filtres et génération */}
							<View style={styles.card}>
								<Text style={styles.subtitle}>Générer un rapport</Text>
								<View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
									<TextInput placeholder="Date de début (YYYY-MM-DD)" value={dateFrom} onChangeText={setDateFrom} style={styles.input} />
									<TextInput placeholder="Date de fin (YYYY-MM-DD)" value={dateTo} onChangeText={setDateTo} style={styles.input} />
								</View>
								<View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
									<TouchableOpacity style={[styles.btn, { backgroundColor: '#2563eb', flex: 1 }]} onPress={() => handleGenerate('complete')} disabled={generateReport.isPending}>
										<Text style={styles.btnText}>{generateReport.isPending ? 'Génération…' : 'Rapport complet'}</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.btn, { backgroundColor: '#10b981', flex: 1 }]} onPress={() => handleGenerate('financial')} disabled={generateReport.isPending}>
										<Text style={styles.btnText}>Financier</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.btn, { backgroundColor: '#f59e0b', flex: 1 }]} onPress={() => handleGenerate('mileage')} disabled={generateReport.isPending}>
										<Text style={styles.btnText}>Kilométrage</Text>
									</TouchableOpacity>
								</View>
							</View>

							<Text style={[styles.subtitle, { marginTop: 12 }]}>Rapports disponibles</Text>
							{isLoading && <ActivityIndicator style={{ marginTop: 12 }} />}
							{!isLoading && reports.length === 0 && (
								<View style={[styles.card, { marginTop: 8 }]}>
									<Text style={styles.muted}>Aucun rapport pour ces dates.</Text>
								</View>
							)}
						</View>
					)}
					renderItem={({ item: r }) => (
						<View style={styles.reportRow}>
							<View style={{ flex: 1 }}>
								<Text style={{ fontWeight: '700' }}>{r.title}</Text>
								<Text style={styles.mutedSmall}>Type: {typeLabel(r.report_type)} • Période: {new Date(r.date_from).toLocaleDateString('fr-FR')} → {new Date(r.date_to).toLocaleDateString('fr-FR')}</Text>
								<Text style={styles.mutedSmall}>{r.missions_count} mission(s) • {formatCurrency(r.total_revenue)}</Text>
							</View>
							<View style={{ gap: 6 }}>
								<Text style={[styles.badge, statusBg(r.status)]}>{statusLabel(r.status)}</Text>
								<View style={{ flexDirection: 'row', gap: 6 }}>
									<TouchableOpacity style={[styles.btnSm, { backgroundColor: '#6366f1' }]} onPress={() => openViewer(r)}>
										<Text style={styles.btnSmText}>Voir</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.btnSm, { backgroundColor: '#ef4444' }]} onPress={() => deleteReport.mutate(r.id)}>
										<Text style={styles.btnSmText}>Supprimer</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
					ListEmptyComponent={null}
				/>

			{/* Viewer de rapport */}
			<Modal visible={viewerOpen} animationType="slide" onRequestClose={() => setViewerOpen(false)}>
				<ScrollView style={[styles.container, { backgroundColor: 'white' }]} contentContainerStyle={{ padding: 16 }}>
					{!!selectedReport && (
						<View>
							<Text style={styles.title}>{selectedReport.title}</Text>
							<Text style={styles.mutedSmall}>Du {new Date(selectedReport.date_from).toLocaleDateString('fr-FR')} au {new Date(selectedReport.date_to).toLocaleDateString('fr-FR')}</Text>

							{/* Stats */}
							<View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
								<View style={styles.card}><Text style={styles.mutedSmall}>Missions</Text><Text style={styles.kpi}>{selectedReport.missions_count}</Text></View>
								<View style={styles.card}><Text style={styles.mutedSmall}>Chiffre d'affaires</Text><Text style={styles.kpi}>{formatCurrency(selectedReport.total_revenue)}</Text></View>
								{!!selectedReport.total_km && <View style={styles.card}><Text style={styles.mutedSmall}>Kilométrage</Text><Text style={styles.kpi}>{selectedReport.total_km} km</Text></View>}
							</View>

							{/* Preuves d'inspection */}
							{(() => {
								const meta: any = selectedReport.metadata || {};
								const missionId = meta?.mission_id || meta?.mission?.id || meta?.summary?.mission_id || null;
								const departure = meta?.departure || meta?.inspection_departure || null;
								const arrival = meta?.arrival || meta?.inspection_arrival || null;
								const depPhotos = normalizePhotoList(departure?.photos).map(getPublicUrlForMissionPhoto).filter(Boolean) as string[];
								const arrPhotos = normalizePhotoList(arrival?.photos).map(getPublicUrlForMissionPhoto).filter(Boolean) as string[];
								const depSig = getPublicUrlForMissionPhoto(departure?.client_signature_url);
								const arrSig = getPublicUrlForMissionPhoto(arrival?.client_signature_url);
								if (depPhotos.length + arrPhotos.length + (depSig ? 1 : 0) + (arrSig ? 1 : 0) === 0) return null;
								return (
									<View style={{ marginTop: 16 }}>
										<Text style={styles.subtitle}>Preuves d'inspection</Text>
										{depPhotos.length > 0 && (
											<View style={{ marginTop: 8 }}>
												<Text style={styles.sectionTitle}>Photos Départ</Text>
												<FlatList
													data={depPhotos}
													keyExtractor={(u, i) => u + i}
													horizontal
													contentContainerStyle={{ gap: 8 }}
													renderItem={({ item }) => (
														<Image source={{ uri: item }} style={styles.photo} />
													)}
												/>
											</View>
										)}
										{!!depSig && (
											<View style={{ marginTop: 8 }}>
												<Text style={styles.sectionTitle}>Signature client (Départ)</Text>
												<Image source={{ uri: depSig }} style={[styles.photo, { height: 120, width: 240 }]} resizeMode="contain" />
											</View>
										)}
										{arrPhotos.length > 0 && (
											<View style={{ marginTop: 8 }}>
												<Text style={styles.sectionTitle}>Photos Arrivée</Text>
												<FlatList
													data={arrPhotos}
													keyExtractor={(u, i) => u + i}
													horizontal
													contentContainerStyle={{ gap: 8 }}
													renderItem={({ item }) => (
														<Image source={{ uri: item }} style={styles.photo} />
													)}
												/>
											</View>
										)}
										{!!arrSig && (
											<View style={{ marginTop: 8 }}>
												<Text style={styles.sectionTitle}>Signature client (Arrivée)</Text>
												<Image source={{ uri: arrSig }} style={[styles.photo, { height: 120, width: 240 }]} resizeMode="contain" />
											</View>
										)}
									</View>
								);
							})()}

							<TouchableOpacity style={[styles.btn, { backgroundColor: '#6b7280', marginTop: 16 }]} onPress={() => setViewerOpen(false)}>
								<Text style={styles.btnText}>Fermer</Text>
							</TouchableOpacity>
						</View>
					)}
				</ScrollView>
					</Modal>
				</View>
	);
};

const statusBg = (s: Report['status']) => ({ available: { backgroundColor: '#0ea5e9' }, generated: { backgroundColor: '#6366f1' }, processing: { backgroundColor: '#f59e0b' } }[s] || { backgroundColor: '#6b7280' });

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f8fafc' },
	title: { fontSize: 22, fontWeight: '800', color: '#111827' },
	subtitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
	sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
	muted: { color: '#6b7280' },
	mutedSmall: { color: '#6b7280', fontSize: 12 },
	kpi: { fontSize: 18, fontWeight: '800', color: '#0ea5e9' },
	card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginTop: 8 },
	input: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, color: '#111827', flex: 1 },
	btn: { padding: 12, borderRadius: 10, alignItems: 'center' },
	btnText: { color: 'white', fontWeight: '700' },
	btnSm: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
	btnSmText: { color: 'white', fontWeight: '700' },
	badge: { color: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontWeight: '700', textAlign: 'center' },
	reportRow: { flexDirection: 'row', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, alignItems: 'center' },
	photo: { width: 120, height: 120, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
});

export default ReportsScreen;
