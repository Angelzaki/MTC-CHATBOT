import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';

const AccountScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [rol, setRol] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verificar que db esté correctamente inicializado
          if (!db) {
            console.error("Firestore no está inicializado");
            throw new Error("Firestore no está inicializado");
          }
          
          console.log("UID del usuario:", user.uid);
          
          // Intentar obtener el documento directamente con la ruta correcta
          // Basado en la captura de pantalla, parece que estamos en la colección "Usuarios"
          // y el documento tiene un ID específico (podría ser el UID del usuario o un ID personalizado)
          const docRef = doc(db, "Usuarios", user.uid);
          console.log("Intentando obtener documento:", docRef);
          
          const docSnap = await getDoc(docRef);
          console.log("Documento existe:", docSnap.exists());

          if (docSnap.exists()) {
            const datos = docSnap.data();
            console.log("Datos obtenidos:", datos);
            
            // Convertir el Timestamp de Firestore a formato legible
            let fechaFormateada = 'Fecha no disponible';
            if (datos.FechaRegistro) {
              try {
                // Convertir el Timestamp de Firestore a fecha JavaScript
                const timestamp = datos.FechaRegistro;
                const fecha = new Date(timestamp.seconds * 1000);
                
                // Formato de fecha: DD/MM/YYYY HH:MM
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const año = fecha.getFullYear();
                const hora = fecha.getHours().toString().padStart(2, '0');
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                
                fechaFormateada = `${dia}/${mes}/${año} ${hora}:${minutos}`;
              } catch (e) {
                console.error("Error al formatear la fecha:", e);
              }
            }
            
            setUserData({
              nombre: datos.Nombre || 'Nombre no disponible',
              correo: datos.Email || user.email || 'Correo no disponible',
              rol: datos.Rol || 'Rol no disponible',
              edad: datos.Edad || 'Edad no disponible',
              fechaRegistro: fechaFormateada,
              contraseñaHash: datos.ContraseñaHash || 'No disponible'
            });
          } else {
            // Si no existen datos en Firestore, usar datos básicos de Auth
            console.log("No se encontraron datos del usuario en Firestore");
            setUserData({
              nombre: user.displayName || 'Nombre no disponible',
              correo: user.email || 'Correo no disponible',
              rol: 'No disponible',
              edad: 'No disponible',
              fechaRegistro: 'No disponible',
              contraseñaHash: 'No disponible'
            });
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          Alert.alert("Error", "No se pudieron cargar los datos del usuario");
        }
      } else {
        setUserData(null);
        // Si no hay usuario logueado, redirigir al login
        navigation.replace('Login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        Alert.alert('Éxito', 'Sesión cerrada correctamente');
        navigation.replace('Login');
      })
      .catch(error => {
        Alert.alert('Error', 'No se pudo cerrar la sesión');
      });
  };

  const handleEditProfile = () => {
    if (userData) {
      setNombre(userData.nombre);
      setEdad(userData.edad.toString());
      setRol(userData.rol);
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!nombre || !edad || !rol) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (user) {
        const docRef = doc(db, "Usuarios", user.uid);
        
        await updateDoc(docRef, {
          Nombre: nombre,
          Edad: parseInt(edad, 10),
          Rol: rol
        });
        
        // Actualizar los datos locales
        setUserData({
          ...userData,
          nombre: nombre,
          edad: edad,
          rol: rol
        });
        
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert('Error', 'No se pudo actualizar el perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (user) {
        // Reautenticar al usuario antes de cambiar la contraseña
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        
        await reauthenticateWithCredential(user, credential);
        
        // Cambiar la contraseña
        await updatePassword(user, newPassword);
        
        // Actualizar el hash de la contraseña en Firestore
        const docRef = doc(db, "Usuarios", user.uid);
        await updateDoc(docRef, {
          ContraseñaHash: newPassword
        });
        
        // Actualizar datos locales
        setUserData({
          ...userData,
          contraseñaHash: newPassword
        });
        
        Alert.alert('Éxito', 'Contraseña actualizada correctamente');
        setShowPasswordModal(false);
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'La contraseña actual es incorrecta');
      } else {
        Alert.alert('Error', 'No se pudo cambiar la contraseña: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHistory = () => {
    // Navegación a historial de consultas (a implementar)
    Alert.alert('Información', 'Función en desarrollo');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Ionicons name="person-circle" size={32} color="#D32F2F" />
        <Text style={styles.headerText}>Mi Cuenta</Text>
      </View>

      {/* Info del Usuario */}
      {userData ? (
        <View style={styles.profileBox}>
          <Image
            source={require('../assets/logo.jpg')}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userData.nombre}</Text>
          <Text style={styles.email}>{userData.correo}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rol:</Text>
              <Text style={styles.infoValue}>{userData.rol}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Edad:</Text>
              <Text style={styles.infoValue}>{userData.edad}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de registro:</Text>
              <Text style={styles.infoValue}>{userData.fechaRegistro}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contraseña:</Text>
              <Text style={styles.infoValue}>{userData.contraseñaHash}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.errorText}>No se pudo cargar la información del usuario.</Text>
      )}

      {/* Opciones de Configuración */}
      <View style={styles.options}>
        <OptionItem 
          icon="create-outline" 
          label="Editar Perfil" 
          onPress={handleEditProfile}
        />
        <OptionItem 
          icon="key-outline" 
          label="Cambiar Contraseña" 
          onPress={handleChangePassword}
        />
        <OptionItem 
          icon="time-outline" 
          label="Historial de Consultas" 
          onPress={handleHistory}
        />
        <OptionItem 
          icon="log-out-outline" 
          label="Cerrar Sesión" 
          onPress={handleLogout} 
        />
      </View>

      {/* Modal para editar perfil */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre:</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Edad:</Text>
              <TextInput
                style={styles.input}
                value={edad}
                onChangeText={setEdad}
                placeholder="Edad"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Rol:</Text>
              <TextInput
                style={styles.input}
                value={rol}
                onChangeText={setRol}
                placeholder="Rol"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña actual:</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Contraseña actual"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nueva contraseña:</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nueva contraseña"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar contraseña:</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar contraseña"
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSavePassword}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const OptionItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#D32F2F" style={styles.optionIcon} />
    <Text style={styles.optionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  profileBox: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  infoContainer: {
    width: '100%',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  options: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#D32F2F',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#D32F2F',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default AccountScreen;