import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { authApi }     from '../services/api'
import { setUser }     from '../store'

export default function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch()
  const [email,    setEmail]    = useState('admin@demo.com')
  const [password, setPassword] = useState('Admin@1234')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const result = await authApi.login(email, password)
      dispatch(setUser(result.data))
      navigation.replace('Main')
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>🏪</Text>
        <Text style={styles.title}>Wholesale Aggregator</Text>
        <Text style={styles.subtitle}>Mobile Dashboard</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnText}>🔑 Login</Text>
          }
        </TouchableOpacity>

        <Text style={styles.hint}>Demo: admin@demo.com / Admin@1234</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#1e293b',
    justifyContent: 'center', padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20, padding: 28,
    alignItems: 'center',
  },
  emoji:    { fontSize: 48, marginBottom: 8 },
  title:    { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 12, fontSize: 14, color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  btn: {
    width: '100%', backgroundColor: '#2563eb',
    borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#93c5fd' },
  btnText:     { color: 'white', fontWeight: 'bold', fontSize: 16 },
  hint:        { color: '#94a3b8', fontSize: 12, marginTop: 16 },
})