// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  StyleSheet, TextInput, TouchableOpacity, Alert, Image, View, Text
} from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Importar métodos de autenticación
import { auth } from '../../firebaseconfig';  // Importar configuración de Firebase


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);  // Autenticación con Firebase
      setLoading(false);
      navigation.replace('HomeTabs');  // Navegar a las pantallas principales
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);  // Mostrar error si ocurre
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>InnovaEdu</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#9E9E9E"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#9E9E9E"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Iniciar sesión'}</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
  input: {
    height: 50, width: '100%', borderColor: '#ccc', borderWidth: 1,
    borderRadius: 25, paddingHorizontal: 15, marginBottom: 16,
  },
  button: {
    backgroundColor: '#D32F2F', borderRadius: 25, height: 50,
    justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  forgotPassword: { marginTop: 12, color: '#9E9E9E' },
});

export default LoginScreen;
