import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { loginUser } from '../services/api';
//import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const handleLogin = async () => {
  try {
    setLoading(true);
    const data = await loginUser(email, password); // token auto-saved inside loginUser (TODO FM-AUTH)
    console.log('Login uspešen:', data);
    // TODO FM-AUTH: temporary navigation – replace with role-aware routing once AuthContext is wired
    navigation.navigate('MajstrProfile');
  } catch (err) {
    setError('Napaka pri prijavi: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>FixMajstr</Text>
      </View>

      <Text style={styles.loginTitle}>LOGIN</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>EMAIL</Text>
        <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <ActivityIndicator size="large" color="#6b7ab5" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.buttonLogin]} onPress={handleLogin}>
              <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.buttonRegisterUser]} onPress={() => navigation.navigate('RegisterUser')}>
              <Text style={styles.buttonText}>REGISTER USER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.buttonRegisterMajstr]} onPress={() => navigation.navigate('RegisterMajstr')}>
              <Text style={styles.buttonText}>REGISTER MAJSTR</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#1a1a2e',
  },
  loginTitle: {
    fontSize: 14,
    letterSpacing: 3,
    color: '#888',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#e8e8e8',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 10,
  },
  button: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLogin: {
    backgroundColor: '#8b9fd4',
  },
  buttonRegisterUser: {
    backgroundColor: '#4a5a8c',
  },
  buttonRegisterMajstr: {
    backgroundColor: '#2d3a6b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
});