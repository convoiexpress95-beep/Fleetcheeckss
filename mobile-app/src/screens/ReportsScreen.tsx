import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Linking, Modal, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase, SUPABASE_URL } from '../config/supabase';
import * as Print from 'expo-print';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { tokens } from '../theme';
import { BRAND_LOGO_URL, BRAND_NAME } from '../branding';

// Helpers URL publics (bucket mission-photos public)
const normalizeKey = (path?: string | null) => {
  if (!path) return null as string | null;
  if (/^https?:\/\//i.test(path)) return path; // déjà une URL complète
  let key = path.replace(/^\/+/, '');
  const pubPrefix = `/storage/v1/object/public/mission-photos/`;
  const fullPrefix = `${SUPABASE_URL}${pubPrefix}`;
  if (key.startsWith(fullPrefix)) key = key.slice(fullPrefix.length);
  if (key.startsWith(pubPrefix)) key = key.slice(pubPrefix.length);
  if (key.startsWith('mission-photos/')) key = key.slice('mission-photos/'.length);
  return key;
};

const publicUrlFor = (path?: string | null) => {
  if (!path) return null as string | null;
  if (/^https?:\/\//i.test(path)) return path;
  const key = normalizeKey(path) as string;
  const { data } = supabase.storage.from('mission-photos').getPublicUrl(key);
  return data.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/mission-photos/${key}`;
};

interface MissionRow {
  id: string;
  title: string;
  reference: string;
  pickup_address?: string | null;
  delivery_address?: string | null;
  created_at: string;
}

async function fetchCompletedMissions(): Promise<MissionRow[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('id, title, reference, pickup_address, delivery_address, created_at')
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as MissionRow[];
}

export default function ReportsScreen() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', 'completed-missions'],
    queryFn: fetchCompletedMissions,
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<MissionRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [depDetails, setDepDetails] = useState<any | null>(null);
  const [arrDetails, setArrDetails] = useState<any | null>(null);
  const [depPhotos, setDepPhotos] = useState<string[]>([]);
  const [arrPhotos, setArrPhotos] = useState<string[]>([]);
  const [depSigUrl, setDepSigUrl] = useState<string | null>(null);
  const [arrSigUrl, setArrSigUrl] = useState<string | null>(null);

  // publicUrlFor et normalizeKey sont disponibles au niveau module

  const dataUrlSignatureMaybe = (obj: any): string | null => {
    const cand = obj?.client_signature_data || obj?.client_signature_base64 || obj?.client_signature || null;
    if (!cand || typeof cand !== 'string') return null;
    if (cand.startsWith('data:image')) return cand;
    // Heuristique simple base64
    if (/^[A-Za-z0-9+/=]+$/.test(cand) && cand.length > 100) return `data:image/png;base64,${cand}`;
    return null;
  };

  const loadMissionDetails = async (m: MissionRow) => {
    setViewLoading(true);
    try {
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('*').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('*').eq('mission_id', m.id).maybeSingle(),
      ]);
      setDepDetails(dep || null);
      setArrDetails(arr || null);
      const depP = Array.isArray(dep?.photos) ? (dep?.photos as unknown as string[]) : [];
      const arrP = Array.isArray(arr?.photos) ? (arr?.photos as unknown as string[]) : [];
      setDepPhotos(depP);
      setArrPhotos(arrP);
  const depSigDataUrl = dataUrlSignatureMaybe(dep);
  const arrSigDataUrl = dataUrlSignatureMaybe(arr);
  setDepSigUrl(depSigDataUrl || publicUrlFor((dep as any)?.client_signature_url as string | null));
  setArrSigUrl(arrSigDataUrl || publicUrlFor((arr as any)?.client_signature_url as string | null));
    } finally {
      setViewLoading(false);
    }
  };

  const openFullReport = async (m: MissionRow) => {
    setViewing(m);
    await loadMissionDetails(m);
  };

  const closeFullReport = () => {
    setViewing(null);
    setDepDetails(null);
    setArrDetails(null);
    setDepPhotos([]);
    setArrPhotos([]);
    setDepSigUrl(null);
    setArrSigUrl(null);
  };

  const renderItem = ({ item }: { item: MissionRow }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>Réf: {item.reference}</Text>
        <Text style={styles.meta} numberOfLines={1}>Départ: {item.pickup_address || '-'}</Text>
        <Text style={styles.meta} numberOfLines={1}>Destination: {item.delivery_address || '-'}</Text>
      </View>
      <View style={styles.actions}>
        {/* 1) Voir le rapport complet */}
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#2563eb' }]} onPress={() => openFullReport(item)} accessibilityLabel="Voir le rapport complet">
          <Ionicons name="eye" size={20} color="#fff" />
        </TouchableOpacity>
        {/* 2) Email rapport + photos */}
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#059669' }]} onPress={() => emailFullReport(item)} accessibilityLabel="Envoyer tout par email">
          <Ionicons name="mail" size={20} color="#fff" />
        </TouchableOpacity>
        {/* 3) Télécharger tout (PDF/ZIP) */}
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#4f46e5' }]} onPress={() => downloadZip(item)} accessibilityLabel="Télécharger tout en PDF">
          <Ionicons name="download" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const exportPdf = async (m: MissionRow) => {
    try {
      setBusyId(m.id);
      // Récupérer les infos d'inspection pour enrichir le PDF
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('*').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('*').eq('mission_id', m.id).maybeSingle(),
      ]);
  const depSig = dataUrlSignatureMaybe(dep) || publicUrlFor((dep as any)?.client_signature_url as string | null);
  const arrSig = dataUrlSignatureMaybe(arr) || publicUrlFor((arr as any)?.client_signature_url as string | null);

      const esc = (v: any) => (v == null || v === '' ? '-' : String(v));

  const logo = BRAND_LOGO_URL;
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; background: ${tokens.colors.background}; padding: 24px; }
              .frame { background: ${tokens.colors.surface}; border: 1px solid ${tokens.colors.border}; border-radius: 16px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
              .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
              .brand { display:flex; align-items:center; gap: 10px; }
              .brand img { height: 40px; width: auto; border-radius: 12px; box-shadow: 0 4px 14px rgba(20,184,166,0.25); }
              .brand .name { font-weight: 800; color:${tokens.colors.primary}; letter-spacing: .2px; }
              .title { font-size: 22px; font-weight: 800; color: ${tokens.colors.onSurface}; }
              .muted { color: ${tokens.colors.onSurface}; opacity:.75 }
              .chips { display:flex; gap:8px; margin: 6px 0 12px; }
              .chip { display:inline-block; background:${tokens.colors.card}; color:${tokens.colors.onSurface}; border:1px solid ${tokens.colors.border}; padding:4px 8px; border-radius:999px; font-size:12px }
              h2 { color: ${tokens.colors.primary}; border-bottom: 2px solid ${tokens.colors.border}; padding-bottom: 6px; margin-top: 8px }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              td, th { border: 1px solid ${tokens.colors.border}; padding: 8px; font-size: 12px; text-align: left; }
              .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
              .signs { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
              .sign { border: 1px dashed ${tokens.colors.border}; border-radius: 12px; padding: 12px; text-align:center; background:${tokens.colors.card} }
              .sign img { max-width: 100%; max-height: 220px; object-fit: contain; border-radius: 8px; background:#fff }
            </style>
          </head>
          <body>
            <div class="frame">
              <div class="header">
                <div class="brand"><img src="${logo}" alt="${BRAND_NAME}" /><span class="name">${BRAND_NAME}</span></div>
                <div class="title">Rapport de mission – ${esc(m.title)}</div>
                <div class="muted">Réf: ${esc(m.reference)}</div>
              </div>
              <div class="chips">
                <span class="chip">De ${esc(m.pickup_address)}</span>
                <span class="chip">À ${esc(m.delivery_address)}</span>
                <span class="chip">Créée: ${new Date(m.created_at).toLocaleString()}</span>
              </div>
              <div class="grid">
                <div>
                  <h2>Départ</h2>
                  <table>
                    <tr><th>Kilométrage</th><td>${esc((dep as any)?.initial_mileage)}</td></tr>
                    <tr><th>Carburant</th><td>${esc((dep as any)?.initial_fuel)}</td></tr>
                    <tr><th>Notes internes</th><td>${esc((dep as any)?.internal_notes)}</td></tr>
                    <tr><th>Email client</th><td>${esc((dep as any)?.client_email)}</td></tr>
                  </table>
                </div>
                <div>
                  <h2>Arrivée</h2>
                  <table>
                    <tr><th>Kilométrage</th><td>${esc((arr as any)?.final_mileage)}</td></tr>
                    <tr><th>Carburant</th><td>${esc((arr as any)?.final_fuel)}</td></tr>
                    <tr><th>Notes conducteur</th><td>${esc((arr as any)?.driver_notes)}</td></tr>
                    <tr><th>Notes client</th><td>${esc((arr as any)?.client_notes)}</td></tr>
                  </table>
                </div>
              </div>
              <div class="signs">
                <div class="sign">
                  <div class="muted">Signature départ</div>
                  ${depSig ? `<img src="${depSig}" alt="Signature départ" />` : `<div class="muted">(Aucune)</div>`}
                </div>
                <div class="sign">
                  <div class="muted">Signature arrivée</div>
                  ${arrSig ? `<img src="${arrSig}" alt="Signature arrivée" />` : `<div class="muted">(Aucune)</div>`}
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setBusyId(null);
    }
  };

  // Email: rapport PDF + toutes les photos en pièces jointes (avec garde-fous)
  const emailFullReport = async (m: MissionRow) => {
    try {
      setBusyId(m.id);
      const [{ data: dep }, { data: arr }] = await Promise.all([
        supabase.from('inspection_departures').select('*').eq('mission_id', m.id).maybeSingle(),
        supabase.from('inspection_arrivals').select('*').eq('mission_id', m.id).maybeSingle(),
      ]);
      const photos = [ ...(dep?.photos || []), ...(arr?.photos || []) ] as string[];

      // PDF de rapport modernisé avec signatures
      const logo = BRAND_LOGO_URL;
      const esc = (v: any) => (v == null || v === '' ? '-' : String(v));
  const depSig = dataUrlSignatureMaybe(dep) || publicUrlFor((dep as any)?.client_signature_url as string | null);
  const arrSig = dataUrlSignatureMaybe(arr) || publicUrlFor((arr as any)?.client_signature_url as string | null);
      const pdfHtml = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; background: ${tokens.colors.background}; padding: 24px; }
              .frame { background: ${tokens.colors.surface}; border: 1px solid ${tokens.colors.border}; border-radius: 16px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
              .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
              .brand { display:flex; align-items:center; gap: 10px; }
              .brand img { height: 40px; width: auto; border-radius: 12px; box-shadow: 0 4px 14px rgba(20,184,166,0.25); }
              .brand .name { font-weight: 800; color:${tokens.colors.primary}; letter-spacing: .2px; }
              .title { font-size: 22px; font-weight: 800; color: ${tokens.colors.onSurface}; }
              .muted { color: ${tokens.colors.onSurface}; opacity:.75 }
              .chips { display:flex; gap:8px; margin: 6px 0 12px; }
              .chip { display:inline-block; background:${tokens.colors.card}; color:${tokens.colors.onSurface}; border:1px solid ${tokens.colors.border}; padding:4px 8px; border-radius:999px; font-size:12px }
              h2 { color: ${tokens.colors.primary}; border-bottom: 2px solid ${tokens.colors.border}; padding-bottom: 6px; margin-top: 8px }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              td, th { border: 1px solid ${tokens.colors.border}; padding: 8px; font-size: 12px; text-align: left; }
              .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
              .signs { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
              .sign { border: 1px dashed ${tokens.colors.border}; border-radius: 12px; padding: 12px; text-align:center; background:${tokens.colors.card} }
              .sign img { max-width: 100%; max-height: 220px; object-fit: contain; border-radius: 8px; background:#fff }
            </style>
          </head>
          <body>
            <div class="frame">
              <div class="header">
                <div class="brand"><img src="${logo}" alt="${BRAND_NAME}" /><span class="name">${BRAND_NAME}</span></div>
                <div class="title">Rapport de mission – ${esc(m.title)}</div>
                <div class="muted">Réf: ${esc(m.reference)}</div>
              </div>
              <div class="chips">
                <span class="chip">De ${esc(m.pickup_address)}</span>
                <span class="chip">À ${esc(m.delivery_address)}</span>
                <span class="chip">Créée: ${new Date(m.created_at).toLocaleString()}</span>
              </div>
              <div class="grid">
                <div>
                  <h2>Départ</h2>
                  <table>
                    <tr><th>Kilométrage</th><td>${esc((dep as any)?.initial_mileage)}</td></tr>
                    <tr><th>Carburant</th><td>${esc((dep as any)?.initial_fuel)}</td></tr>
                    <tr><th>Notes internes</th><td>${esc((dep as any)?.internal_notes)}</td></tr>
                    <tr><th>Email client</th><td>${esc((dep as any)?.client_email)}</td></tr>
                  </table>
                </div>
                <div>
                  <h2>Arrivée</h2>
                  <table>
                    <tr><th>Kilométrage</th><td>${esc((arr as any)?.final_mileage)}</td></tr>
                    <tr><th>Carburant</th><td>${esc((arr as any)?.final_fuel)}</td></tr>
                    <tr><th>Notes conducteur</th><td>${esc((arr as any)?.driver_notes)}</td></tr>
                    <tr><th>Notes client</th><td>${esc((arr as any)?.client_notes)}</td></tr>
                  </table>
                </div>
              </div>
              <div class="signs">
                <div class="sign">
                  <div class="muted">Signature départ</div>
                  ${depSig ? `<img src="${depSig}" alt="Signature départ" />` : `<div class="muted">(Aucune)</div>`}
                </div>
                <div class="sign">
                  <div class="muted">Signature arrivée</div>
                  ${arrSig ? `<img src="${arrSig}" alt="Signature arrivée" />` : `<div class="muted">(Aucune)</div>`}
                </div>
              </div>
            </div>
          </body>
        </html>`;
      const { uri: pdfUri } = await Print.printToFileAsync({ html: pdfHtml });

      // Télécharger les photos localement pour les attacher (limite: 10 pour rester fiable)
      const MAX_ATTACH = 10;
      const toAttach: string[] = [pdfUri];
      const signedList: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        const signed = publicUrlFor(p);
        if (signed) signedList.push(signed);
        if (toAttach.length - 1 >= MAX_ATTACH) continue; // déjà 10 photos
        try {
          const ext = p.split('.').pop() || 'jpg';
          const fileUri = `${FileSystem.cacheDirectory}mission-${m.id}-${i}.${ext}`;
          const res = await FileSystem.downloadAsync(signed!, fileUri);
          if (res.status === 200) toAttach.push(res.uri);
        } catch {}
      }

      const body = `Bonjour,\n\nVeuillez trouver ci-joint le rapport ${m.reference} ainsi que les photos.\nSi certaines pièces n'apparaissent pas, voici aussi des liens temporaires:\n\n${signedList.map((u,i)=>`Photo ${i+1}: ${u}`).join('\n')}\n\nCordialement,`;

      await MailComposer.composeAsync({
        subject: `Rapport de mission ${m.reference}`,
        body,
        attachments: toAttach,
      });
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setBusyId(null);
    }
  };

  const downloadZip = async (m: MissionRow) => {
    try {
      setBusyId(m.id);
      const fnUrl = `${SUPABASE_URL}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(m.id)}`;
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;

      if (!token) {
        // Ouvrir dans le navigateur si pas de token disponible
        await Linking.openURL(fnUrl);
        return;
      }

  const fileUri = FileSystem.cacheDirectory + `mission-${m.reference || m.id}-photos.pdf`;
      const res = await FileSystem.downloadAsync(fnUrl, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status !== 200) {
        await Linking.openURL(fnUrl);
        return;
      }

  await Sharing.shareAsync(res.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (error) return <View style={styles.center}><Text>Erreur de chargement</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h1}>Rapports de missions</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.refresh}>
          <Ionicons name="refresh" size={20} color={tokens.colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Aucune mission finalisée</Text>}
      />
      {/* Modal Rapport Complet */}
      <Modal visible={!!viewing} animationType="slide" onRequestClose={closeFullReport}>
        <View style={[styles.container, { backgroundColor: tokens.colors.background }]}> 
          <View style={[styles.modalHeader, { borderBottomColor: tokens.colors.border }]}> 
            <TouchableOpacity onPress={closeFullReport} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={tokens.colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.h1}>Rapport complet</Text>
            <View style={{ width: 32 }} />
          </View>
          {viewLoading || !viewing ? (
            <View style={styles.center}><ActivityIndicator /></View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
              <View style={styles.sectionCard}>
                <Text style={styles.title}>{viewing.title}</Text>
                <Text style={styles.meta}>Réf: {viewing.reference}</Text>
                <Text style={styles.meta}>De: {viewing.pickup_address || '-'}</Text>
                <Text style={styles.meta}>À: {viewing.delivery_address || '-'}</Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.subtitle}>Départ</Text>
                <Text style={styles.meta}>Kilométrage: {depDetails?.initial_mileage ?? '-'}</Text>
                <Text style={styles.meta}>Carburant: {depDetails?.initial_fuel ?? '-'}</Text>
                <Text style={styles.meta}>Email client: {depDetails?.client_email ?? '-'}</Text>
                <Text style={styles.meta}>Notes internes: {depDetails?.internal_notes ?? '-'}</Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.subtitle}>Arrivée</Text>
                <Text style={styles.meta}>Kilométrage: {arrDetails?.final_mileage ?? '-'}</Text>
                <Text style={styles.meta}>Carburant: {arrDetails?.final_fuel ?? '-'}</Text>
                <Text style={styles.meta}>Notes conducteur: {arrDetails?.driver_notes ?? '-'}</Text>
                <Text style={styles.meta}>Notes client: {arrDetails?.client_notes ?? '-'}</Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.subtitle}>Signatures</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={styles.signBox}>
                    <Text style={styles.meta}>Départ</Text>
                    {depSigUrl ? (
                      <Image source={{ uri: depSigUrl }} style={styles.signImg} />
                    ) : (
                      <Text style={styles.meta}>(Aucune)</Text>
                    )}
                  </View>
                  <View style={styles.signBox}>
                    <Text style={styles.meta}>Arrivée</Text>
                    {arrSigUrl ? (
                      <Image source={{ uri: arrSigUrl }} style={styles.signImg} />
                    ) : (
                      <Text style={styles.meta}>(Aucune)</Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.subtitle}>Photos départ</Text>
                <View style={styles.photosGrid}>
                  {depPhotos.length === 0 ? (
                    <Text style={styles.meta}>(Aucune)</Text>
                  ) : depPhotos.map((p, idx) => (
                    <PhotoTile key={`dep-${idx}`} path={p} missionId={viewing.id} />
                  ))}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.subtitle}>Photos arrivée</Text>
                <View style={styles.photosGrid}>
                  {arrPhotos.length === 0 ? (
                    <Text style={styles.meta}>(Aucune)</Text>
                  ) : arrPhotos.map((p, idx) => (
                    <PhotoTile key={`arr-${idx}`} path={p} missionId={viewing.id} />
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
      {busyId && (
        <View style={styles.busyOverlay}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { fontSize: 20, fontWeight: '700', color: tokens.colors.onSurface },
  refresh: { padding: 6, borderRadius: 8, backgroundColor: tokens.colors.card },
  card: { backgroundColor: tokens.colors.surface, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, borderWidth: 1, borderColor: tokens.colors.border },
  title: { fontSize: 16, fontWeight: '700', color: tokens.colors.onSurface },
  subtitle: { fontSize: 13, color: tokens.colors.onSurface },
  meta: { fontSize: 12, color: tokens.colors.onSurface },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  busyOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  modalHeader: { paddingTop: 12, paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.colors.card },
  sectionCard: { backgroundColor: tokens.colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: tokens.colors.border },
  signBox: { flex: 1, backgroundColor: tokens.colors.card, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: tokens.colors.border, alignItems: 'center', justifyContent: 'center' },
  signImg: { width: '100%', height: 180, resizeMode: 'contain' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

// Tuile Photo avec action de téléchargement/partage
const PhotoTile: React.FC<{ path: string; missionId: string }> = ({ path, missionId }) => {
  const [downloading, setDownloading] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  React.useEffect(() => {
    setThumbUrl(publicUrlFor(path));
  }, [path]);

  const onDownload = async () => {
    try {
      setDownloading(true);
  const url = publicUrlFor(path);
      if (!url) {
        Alert.alert('Erreur', "Lien signé indisponible");
        return;
      }
      const ext = path.split('.').pop() || 'jpg';
      const fileUri = `${FileSystem.cacheDirectory}mission-${missionId}-${Date.now()}.${ext}`;
      const res = await FileSystem.downloadAsync(url, fileUri);
      if (res.status === 200) {
        await Sharing.shareAsync(res.uri);
      } else {
        await Linking.openURL(url);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <TouchableOpacity onPress={onDownload} style={{ width: '31%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: tokens.colors.border, backgroundColor: tokens.colors.card, alignItems: 'center', justifyContent: 'center' }}>
      {thumbUrl ? (
        <Image source={{ uri: thumbUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Ionicons name="image" size={20} color={tokens.colors.onSurface} />
      )}
      {downloading && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};
