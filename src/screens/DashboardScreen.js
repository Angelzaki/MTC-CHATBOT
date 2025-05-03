import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const totalConsultas = 1200;
  const categorias = [
    { name: 'Licencias', consultas: 400 },
    { name: 'Reglas de Tránsito', consultas: 300 },
    { name: 'Ciclovías', consultas: 250 },
    { name: 'Otros', consultas: 250 },
  ];

  const usuarios = [
    { name: 'Conductores', value: 600 },
    { name: 'Ciclistas', value: 300 },
    { name: 'Peatones', value: 200 },
    { name: 'Otros', value: 100 },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Ionicons name="analytics" size={24} color="#D32F2F" />
        <Text style={styles.headerText}>Resumen de Actividad</Text>
      </View>

      {/* Tarjeta Principal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total de Consultas</Text>
        <Text style={styles.cardValue}>{totalConsultas}</Text>
      </View>

      {/* Gráfico de Barras */}
      <Text style={styles.sectionTitle}>Categorías Más Consultadas</Text>
      <BarChart
        data={{
          labels: categorias.map((cat) => cat.name),
          datasets: [
            {
              data: categorias.map((cat) => cat.consultas),
            },
          ],
        }}
        width={width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />

      {/* Gráfico Circular */}
      <Text style={styles.sectionTitle}>Proporción de Usuarios por Tipo</Text>
      <PieChart
        data={usuarios.map((user) => ({
          name: user.name,
          population: user.value,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }))}
        width={width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        accessor="population"
        backgroundColor="transparent"
        style={styles.chart}
      />

      {/* Historial de Consultas */}
      <Text style={styles.sectionTitle}>Historial de Consultas Recientes</Text>
      <View style={styles.timeline}>
        <Text style={styles.timelineItem}>1. ¿Cómo renovar mi licencia?</Text>
        <Text style={styles.timelineItem}>2. ¿Dónde están las ciclovías en Lima?</Text>
        <Text style={styles.timelineItem}>3. ¿Qué documentos necesito para conducir?</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chart: {
    marginBottom: 24,
    borderRadius: 16,
  },
  timeline: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  timelineItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
});

export default DashboardScreen;
