import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import ClientBookingsScreen from '../screens/client/ClientBookingsScreen';
import ClientProfileScreen from '../screens/client/ClientProfileScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import { Search, Calendar, User, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function ClientNavigator() {
    const insets = useSafeAreaInsets();
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4f46e5', // indigo-600
                tabBarInactiveTintColor: '#94a3b8', // slate-400
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    height: 60 + Math.max(insets.bottom, 10),
                    paddingBottom: 8 + insets.bottom,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                }
            }}
        >
            <Tab.Screen
                name="Discover"
                component={ClientHomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Search color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Bookings"
                component={ClientBookingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Messages"
                component={ChatListScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ClientProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
}
