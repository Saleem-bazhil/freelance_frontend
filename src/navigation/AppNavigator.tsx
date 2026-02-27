import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootState } from '../store/store';
import AuthNavigator from './AuthNavigator';
import FreelancerStackNavigator from './FreelancerStackNavigator';
import ClientStackNavigator from './ClientStackNavigator';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isAuthenticated, isLoading, role } = useSelector((state: RootState) => state.auth);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="AuthGroup" component={AuthNavigator} />
                ) : role === 'ADMIN' ? (
                    <Stack.Screen name="AdminHome" component={AdminDashboardScreen} />
                ) : role === 'FREELANCER' ? (
                    <Stack.Screen name="FreelancerHome" component={FreelancerStackNavigator} />
                ) : (
                    <Stack.Screen name="ClientHome" component={ClientStackNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
