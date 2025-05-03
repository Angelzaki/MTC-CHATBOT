import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const noticias = [
  {
    id: '1',
    titulo: 'Nueva regulación para el transporte urbano',
    descripcion: 'El MTC anuncia nuevas medidas para mejorar el servicio de transporte en Lima.',
    imagen: null,
  },
  {
    id: '2',
    titulo: 'Mejoras en infraestructura vial',
    descripcion: 'Se invertirán millones en la rehabilitación de carreteras clave en la sierra.',
    imagen: null,
  },
  {
    id: '3',
    titulo: 'Digitalización de trámites',
    descripcion: 'Ahora puedes renovar tu licencia completamente en línea con InnovaEdu.',
    imagen: null,
  },
];

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerImagePlaceholder}>
          {/* Aquí puedes insertar una imagen destacada */}
          <Text style={styles.bannerText}>Bienvenido a InnovaEdu</Text>
        </View>
      </View>

      {/* Sección de Noticias */}
      <Text style={styles.sectionTitle}>Noticias Relevantes</Text>
      {noticias.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.imagePlaceholder}>
            {/* Imagen futura */}
            <Text style={{ color: '#9E9E9E' }}>Imagen</Text>
          </View>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <Text style={styles.cardDescription}>{item.descripcion}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  banner: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  bannerImagePlaceholder: {
    width: width - 32,
    height: 180,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  bannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
