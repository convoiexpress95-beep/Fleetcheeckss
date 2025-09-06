import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { tokens } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { BRAND_LOGO_URL } from '../branding';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  // SVG inline pour éviter toute dépendance externe et garantir un rendu net
  // Utilise l'image PNG distante (nouveau logo)
  const LOGO_IMG = BRAND_LOGO_URL;
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const MAX_W = 360;
  const MIN_W = 260;
  const H_MARGIN = 48;
  const LOGO_W = Math.max(MIN_W, Math.min(MAX_W, SCREEN_WIDTH - H_MARGIN));
  const LOGO_RATIO = 2.35; // ~380/162

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={["#065f46", "#34d399"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
    <View style={styles.content}>
        <View style={styles.header}>
          {/* Logo avec bords arrondis premium + glow bleu */}
      <View style={[styles.logoWrap, { width: LOGO_W, borderRadius: 24 }]}> 
            <Image
              source={{ uri: LOGO_IMG }}
              style={[
                styles.logoImage,
                { width: LOGO_W, aspectRatio: LOGO_RATIO, borderRadius: 20, transform: [{ scaleX: 1.06 }] },
              ]}
              accessible
              accessibilityLabel="FleetChecks"
            />
          </View>
          {/* Variante texte dégradé, similaire au style web (version conservée) + halo lumineux */}
          <View style={styles.brandWrap}>
            {/* Couches de glow derrière le texte */}
            <Text style={styles.glowTextStrong}>FleetChecks</Text>
            <Text style={styles.glowTextSoft}>FleetChecks</Text>
            <MaskedView
              style={styles.brandMaskContainer}
              maskElement={<Text style={styles.brandGradientMask}>FleetChecks</Text>}
            >
              <LinearGradient
                colors={["#06b6d4", "#34d399", "#14b8a6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.brandGradientFill}>FleetChecks</Text>
              </LinearGradient>
            </MaskedView>
          </View>
          <Text style={styles.subtitle}>Application Convoyeurs</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre.email@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Votre mot de passe"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Application réservée aux convoyeurs autorisés
          </Text>
        </View>
  </View>
  </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  color: tokens.colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  color: tokens.colors.onPrimary,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandWrap: {
    marginBottom: 14,
    alignSelf: 'center',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMaskContainer: {
    // Aligné au centre, s'adapte au texte
  },
  brandGradientMask: {
  fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.2,
  },
  brandGradientFill: {
  fontSize: 28,
    fontWeight: '800',
    // Rendre le texte invisible, seule la zone masque importe
    color: 'transparent',
    paddingHorizontal: 4,
  },
  glowTextStrong: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '800',
    // Couleur du texte quasi-transparente pour ne garder que le halo
    color: 'rgba(0,0,0,0.02)',
    textShadowColor: 'rgba(52, 211, 153, 0.85)', // vert clair
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  glowTextSoft: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.01)',
    textShadowColor: 'rgba(6, 182, 212, 0.45)', // cyan doux
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  logoWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoImage: {
    resizeMode: 'contain',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  color: tokens.colors.onSurface,
    marginBottom: 6,
  },
  input: {
  backgroundColor: tokens.colors.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  borderColor: tokens.colors.border,
  color: tokens.colors.onSurface,
  },
  button: {
  backgroundColor: tokens.colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
  backgroundColor: tokens.colors.border,
  },
  buttonText: {
  color: tokens.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  color: tokens.colors.onSurface,
    textAlign: 'center',
  },
});