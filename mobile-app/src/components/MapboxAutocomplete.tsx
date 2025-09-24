import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import Constants from 'expo-constants';

const MAPBOX_TOKEN: string | undefined = (Constants?.expoConfig?.extra as any)?.MAPBOX_TOKEN;

export interface MapboxSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
}

export default function MapboxAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder,
  country = 'FR',
  containerStyle,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onSelect: (s: MapboxSuggestion) => void;
  placeholder?: string;
  country?: string;
  containerStyle?: ViewStyle;
}) {
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    if (timer.current) clearTimeout(timer.current);
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?autocomplete=true&language=fr&limit=6&country=${country}&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        const json = await res.json();
        const feats = (json.features || []).map((f: any) => ({ id: f.id, place_name: f.place_name, text: f.text, center: f.center }));
        setSuggestions(feats);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChangeText}
      />
      {!!suggestions.length && (
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={suggestions}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => { onSelect(item); setSuggestions([]); }}>
              <Text style={styles.itemText}>{item.place_name}</Text>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}
      {!MAPBOX_TOKEN && (
        <Text style={styles.warn}>MAPBOX_TOKEN manquant (app.json → extra.MAPBOX_TOKEN)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  input: { backgroundColor: '#0f172a', color: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1f2937' },
  list: { position: 'absolute', top: 48, left: 0, right: 0, backgroundColor: '#0f172a', borderRadius: 10, borderWidth: 1, borderColor: '#1f2937', maxHeight: 200, zIndex: 10 },
  item: { paddingHorizontal: 10, paddingVertical: 10 },
  itemText: { color: '#e5e7eb' },
  warn: { color: '#f59e0b', marginTop: 6 },
});