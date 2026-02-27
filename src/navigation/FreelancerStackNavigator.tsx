import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FreelancerNavigator from './FreelancerNavigator';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import FreelancerBookingsScreen from '../screens/freelancer/FreelancerBookingsScreen';

const Stack = createNativeStackNavigator();

export default function FreelancerStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* The main bottom tabs */}
            <Stack.Screen name="FreelancerTabs" component={FreelancerNavigator} />
            {/* Details and flows pushed on top of tabs */}
            <Stack.Screen
                name="ChatDetail"
                component={ChatDetailScreen}
                options={{ presentation: 'card' }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ presentation: 'modal' }}
            />
            <Stack.Screen
                name="FreelancerBookings"
                component={FreelancerBookingsScreen}
            />
        </Stack.Navigator>
    );
}
