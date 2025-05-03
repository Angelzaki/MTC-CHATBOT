import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // o desde 'react-native-vector-icons'
import HomeScreen from '../screens/HomeScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import CuentaScreen from '../screens/CuentaScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#D32F2F',
                tabBarInactiveTintColor: '#9E9E9E',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0.5,
                    borderTopColor: '#E0E0E0',
                    height: 100,
                    paddingBottom: 50,
                    paddingTop: 5,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Chatbot':
                            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                            break;
                        case 'Cuenta':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        case 'Dashboard':
                            iconName = focused ? 'analytics' : 'analytics-outline';
                            break;
                    }

                    return <Ionicons name={iconName} size={26} color={color} style={{ marginBottom: -4 }} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Chatbot' }} />
            <Tab.Screen name="Cuenta" component={CuentaScreen} options={{ title: 'Cuenta' }} />
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        </Tab.Navigator>
    );
}
