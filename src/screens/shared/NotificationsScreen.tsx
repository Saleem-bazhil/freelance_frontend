import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react-native';
import api from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notification/notifications/');
            setNotifications(res.data.results || res.data);
        } catch (err) {
            console.log('Error fetching notifications', err);
        } finally {
            setLoading(false);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                })
            ]).start();
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notification/notifications/${id}/mark_as_read/`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.log('Error marking as read', err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'BOOKING': return <CheckCircle size={22} color="#10b981" />;
            case 'PAYMENT': return <Info size={22} color="#3b82f6" />;
            case 'SYSTEM': return <AlertTriangle size={22} color="#f59e0b" />;
            default: return <Bell size={22} color="#6366f1" />;
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 20) + 16 }}>
            <View className="px-6 mb-8 flex-row justify-between items-center">
                <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">Notifications</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {notifications.length === 0 ? (
                        <View className="items-center justify-center py-24 px-4 bg-white rounded-[32px] border border-slate-100 shadow-sm shadow-slate-100 mt-4">
                            <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6 border border-indigo-100/50">
                                <Bell size={44} color="#6366f1" strokeWidth={1.5} />
                            </View>
                            <Text className="text-2xl font-extrabold text-slate-900 mb-2">You're all caught up!</Text>
                            <Text className="text-slate-500 text-center font-medium leading-relaxed px-4">We'll notify you when there's an update on your bookings or payments.</Text>
                        </View>
                    ) : (
                        notifications.map((notif, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => !notif.is_read && markAsRead(notif.id)}
                                className={`bg-white rounded-[24px] p-5 mb-4 shadow-sm border active:scale-[0.98] transition-all ${notif.is_read ? 'border-slate-100 shadow-slate-200/50' : 'border-indigo-100 shadow-indigo-200/50 bg-indigo-50/40'} flex-row items-start`}
                            >
                                <View className={`w-14 h-14 rounded-[20px] items-center justify-center mr-4 ${notif.is_read ? 'bg-slate-50 border border-slate-100' : 'bg-white border border-indigo-100 shadow-sm shadow-indigo-100/50'}`}>
                                    {getIcon(notif.notification_type)}
                                </View>
                                <View className="flex-1 justify-center pt-1">
                                    <View className="flex-row justify-between items-start mb-1.5">
                                        <Text className={`text-lg flex-1 pr-3 leading-tight ${notif.is_read ? 'font-bold text-slate-800' : 'font-extrabold text-indigo-900'}`}>{notif.title}</Text>
                                        {!notif.is_read && <View className="w-3 h-3 bg-indigo-500 rounded-full mt-1.5 shadow-sm shadow-indigo-200" />}
                                    </View>
                                    <Text className={`text-sm leading-relaxed ${notif.is_read ? 'text-slate-500 font-medium' : 'text-indigo-800/80 font-semibold'} mb-2`}>{notif.message}</Text>
                                    <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                    <View className="h-20"></View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

