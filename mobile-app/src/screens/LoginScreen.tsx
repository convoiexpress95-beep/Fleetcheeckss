import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Linking, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ fullName: '', email: '', password: '' });

  // Compute logo URL: prefer explicit env logo URL, then site public asset, then icon fallback
  const baseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL || 'https://app.fleetcheck.fr';
  const providedLogo = (process.env.EXPO_PUBLIC_LOGO_URL as string) || 'https://i.ibb.co/RTP2P9FC/Chat-GPT-Image-7-sept-2025-03-32-39.png';
  const fallbackLogo = `${baseUrl}/icon-128x128.png`;
  const [logoUri, setLogoUri] = useState<string>(providedLogo);

  const handleLogin = async () => {
    if (!login.email || !login.password) return;
    setLoading(true);
    await signIn(login.email, login.password);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!signup.email || !signup.password || !signup.fullName) return;
    setLoading(true);
    await signUp(signup.email, signup.password, signup.fullName);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background gradients to match web theme */}
      <LinearGradient
        colors={["#0b1020", "#111827"]}
        style={StyleSheet.absoluteFillObject as any}
      />
      <LinearGradient
        // cosmic-like glow blob (top-left)
        colors={["#7c3aed66", "#2563eb33", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: -120, left: -80, width: 320, height: 320, borderRadius: 320 }}
      />
      <LinearGradient
        // sunset-like glow blob (bottom-right)
        colors={["#f9731666", "#ef444433", "transparent"]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={{ position: 'absolute', bottom: -140, right: -100, width: 360, height: 360, borderRadius: 360 }}
      />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}> 
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={["#7c3aed66", "#2563eb33", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGlow}
            />
            <BlurView intensity={50} tint="dark" style={styles.logoGlass}>
              <View style={styles.logoInner}>
                <Image
                  source={{ uri: logoUri }}
                  style={{ width: 72, height: 72, borderRadius: 12 }}
                  resizeMode="contain"
                />
              </View>
            </BlurView>
          </View>
          <Text style={styles.title}>FleetCheck's</Text>
          <Text style={styles.subtitle}>Gérez vos inspections véhicules</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.welcomeTitle}>Bienvenue</Text>
            <Text style={styles.welcomeDesc}>Connectez-vous ou créez un compte pour accéder à FleetCheck's</Text>
          </View>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setTab('login')} style={styles.tab}>
              {tab === 'login' ? (
                <LinearGradient colors={["#7c3aed", "#2563eb"]} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.tabActiveBg}>
                  <Text style={[styles.tabText, styles.tabTextActive]}>Connexion</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>Connexion</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('signup')} style={styles.tab}>
              {tab === 'signup' ? (
                <LinearGradient colors={["#f97316", "#ef4444"]} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.tabActiveBg}>
                  <Text style={[styles.tabText, styles.tabTextActive]}>Inscription</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>Inscription</Text>
              )}
            </TouchableOpacity>
          </View>

          {tab === 'login' ? (
            <View style={styles.form}> 
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={login.email}
                  onChangeText={(t) => setLogin((p) => ({ ...p, email: t }))}
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={login.password}
                  onChangeText={(t) => setLogin((p) => ({ ...p, password: t }))}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <LinearGradient
                  colors={["#7c3aed", "#2563eb"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.button, loading && styles.buttonDisabled]}
                >
                  <Text style={styles.buttonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => login.email && resetPassword(login.email)} style={{ alignSelf: 'center', marginTop: 8 }}>
                <Text style={{ color: '#93c5fd' }}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}> 
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom complet</Text>
                <TextInput
                  style={styles.input}
                  value={signup.fullName}
                  onChangeText={(t) => setSignup((p) => ({ ...p, fullName: t }))}
                  placeholder="Votre nom complet"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={signup.email}
                  onChangeText={(t) => setSignup((p) => ({ ...p, email: t }))}
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={signup.password}
                  onChangeText={(t) => setSignup((p) => ({ ...p, password: t }))}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity onPress={handleSignup} disabled={loading}>
                <LinearGradient
                  colors={["#f97316", "#ef4444"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.buttonAlt, loading && styles.buttonDisabled]}
                >
                  <Text style={styles.buttonText}>{loading ? 'Création...' : "Créer mon compte"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footer}> 
          <Text style={styles.footerText}>En vous inscrivant, vous acceptez nos conditions d’utilisation.</Text>
          <TouchableOpacity onPress={() => Linking.openURL(process.env.EXPO_PUBLIC_WEB_BASE_URL || 'https://app.fleetcheck.fr')} style={{ marginTop: 6 }}>
            <Text style={{ color: '#a5b4fc' }}>Retour au site web</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1020' },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  logoWrapper: { position: 'relative', marginBottom: 16 },
  logoGlow: { position: 'absolute', top: -16, left: -16, right: -16, bottom: -16, borderRadius: 28 },
  logoGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.08)' },
  logoInner: { padding: 14, alignItems: 'center', justifyContent: 'center' },
  form: { marginTop: 12, marginBottom: 8 },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
  },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonAlt: { backgroundColor: '#f97316', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: { alignItems: 'center', marginTop: 16 },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 16, padding: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: '#e9d5ff' },
  welcomeDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 0, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#7c3aed' },
  tabActiveBg: { width: '100%', paddingVertical: 12, alignItems: 'center' },
  tabText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
});