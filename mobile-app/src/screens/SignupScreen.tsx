import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stayConnected, setStayConnected] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setSubmitting(true);
    try {
      await signUp(email.trim(), password);
      navigation.replace('Login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez la plateforme FleetCheck</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="vous@exemple.com"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather 
              name={showPassword ? "eye-off" : "eye"} 
              size={20} 
              color="#9ca3af" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Feather 
              name={showConfirmPassword ? "eye-off" : "eye"} 
              size={20} 
              color="#9ca3af" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setStayConnected(!stayConnected)}
        >
          <View style={[styles.checkbox, stayConnected && styles.checkboxChecked]}>
            {stayConnected && (
              <Feather name="check" size={14} color="#fff" />
            )}
          </View>
          <Text style={styles.checkboxText}>Rester connecté</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submit} onPress={onSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Créer le compte</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.helpLink}>
          <Text style={styles.helpText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 24, justifyContent: 'center' },
  header: { marginBottom: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#9ca3af', fontSize: 14, marginTop: 6 },
  form: { marginTop: 8 },
  label: { color: '#cbd5e1', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', marginBottom: 14 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  checkboxText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  submit: { backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
  helpLink: { alignItems: 'center', marginTop: 16 },
  helpText: { color: '#93c5fd' },
});