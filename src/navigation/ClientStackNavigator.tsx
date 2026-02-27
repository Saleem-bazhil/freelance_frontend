import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientNavigator from './ClientNavigator';
import FreelancerDetailsScreen from '../screens/client/FreelancerDetailsScreen';
import BookingCheckoutScreen from '../screens/client/BookingCheckoutScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import AddReviewScreen from '../screens/client/AddReviewScreen';

const Stack = createNativeStackNavigator();

export default function ClientStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* The main bottom tabs */}
            <Stack.Screen name="ClientTabs" component={ClientNavigator} />
            {/* Details and flows pushed on top of tabs */}
            <Stack.Screen
                name="FreelancerDetails"
                component={FreelancerDetailsScreen}
                options={{ presentation: 'card' }}
            />
            <Stack.Screen
                name="BookingCheckout"
                component={BookingCheckoutScreen}
                options={{ presentation: 'modal' }}
            />
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
                name="AddReview"
                component={AddReviewScreen}
                options={{ presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
}
