// src/navigation/RootNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/DashboardScreen';
import EntryFormScreen from '../screens/EntryFormScreen';
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { 
          backgroundColor: colors.backgroundCard,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: { 
          fontWeight: 'bold',
          color: colors.textPrimary,
        },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Body Book' }}
      />
      <Stack.Screen
        name="Entry"
        component={EntryFormScreen}
        options={{ title: 'Log Entry' }}
      />
    </Stack.Navigator>
  );
}