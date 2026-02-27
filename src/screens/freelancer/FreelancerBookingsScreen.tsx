import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import api from '../../services/api';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FreelancerBookingsScreen() {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/booking/bookings/');
            setBookings(res.data.results || res.data);
        } catch (err) {
            console.log('Error fetching freelancer bookings', err);
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

    const updateBookingStatus = async (id: number, newStatus: string) => {
        try {
            await api.patch(`/booking/bookings/${id}/update_status/`, { status: newStatus });
            Alert.alert('Success', `Booking marked as ${newStatus}`);
            fetchBookings(); // Refresh the list
        } catch (err) {
            console.log('Failed to update booking status', err);
            Alert.alert('Error', 'Could not update booking status.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 border-amber-200 text-amber-700';
            case 'CONFIRMED': return 'bg-indigo-100 border-indigo-200 text-indigo-700';
            case 'COMPLETED': return 'bg-emerald-100 border-emerald-200 text-emerald-700';
            case 'CANCELLED': return 'bg-rose-100 border-rose-200 text-rose-700';
            default: return 'bg-slate-100 border-slate-200 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} color="#d97706" />;
            case 'CONFIRMED': return <CheckCircle size={16} color="#4338ca" />;
            case 'COMPLETED': return <CheckCircle size={16} color="#059669" />;
            case 'CANCELLED': return <XCircle size={16} color="#e11d48" />;
            default: return <Clock size={16} color="#64748b" />;
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
        <View className="flex-1 bg-slate-50">
            <View
                className="bg-white pb-4 px-6 shadow-sm shadow-slate-200 border-b border-slate-100 flex-row items-center z-10"
                style={{ paddingTop: Math.max(insets.top, 20) + 16 }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-4"
                >
                    <ArrowLeft color="#475569" size={20} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 tracking-tight">Booking Requests</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {bookings.length === 0 ? (
                        <View className="items-center justify-center py-24 px-4 bg-white rounded-[32px] border border-slate-100 mt-4 shadow-sm shadow-slate-100">
                            <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6 border border-indigo-100/50">
                                <CalendarIcon size={44} color="#6366f1" strokeWidth={1.5} />
                            </View>
                            <Text className="text-2xl font-extrabold text-slate-900 mb-3 text-center">No bookings yet</Text>
                            <Text className="text-slate-500 text-center text-base font-medium leading-relaxed">When clients request to book your services, they will appear here.</Text>
                        </View>
                    ) : (
                        bookings.map((booking, index) => {
                            const statusStyle = getStatusColor(booking.status);
                            return (
                                <View key={index} className="bg-white rounded-[28px] p-5 mb-5 shadow-lg shadow-slate-200/40 border border-slate-50">
                                    <View className="flex-row justify-between flex-wrap gap-2 items-start mb-5">
                                        <View className="flex-1">
                                            <Text className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1.5">Client</Text>
                                            <Text className="text-2xl font-extrabold text-slate-900 tracking-tight">{booking.client?.user?.username || `Client Id: ${booking.client}`}</Text>
                                        </View>
                                        <View className={`px-3 py-1.5 rounded-xl border flex-row items-center shadow-sm ${statusStyle.replace(/text-[a-z]+-[0-9]+/, '')}`}>
                                            {getStatusIcon(booking.status)}
                                            <Text className={`font-bold text-xs ml-1.5 uppercase tracking-wider ${statusStyle.split(' ').find(s => s.startsWith('text-'))}`}>{booking.status}</Text>
                                        </View>
                                    </View>

                                    <View className="bg-slate-50 p-5 rounded-[20px] border border-slate-100 space-y-3 shadow-inner">
                                        <View className="flex-row items-center">
                                            <CalendarIcon size={18} color="#64748b" className="mr-3" />
                                            <Text className="text-slate-700 font-semibold text-base">
                                                {new Date(booking.start_datetime).toLocaleDateString()} at {new Date(booking.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>

                                        <View className="flex-row justify-between items-center pt-3 border-t border-slate-200/80">
                                            <Text className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Est.</Text>
                                            <Text className="text-indigo-700 font-black text-xl">${booking.total_amount}</Text>
                                        </View>

                                        {/* Action buttons based on status */}
                                        {booking.status === 'PENDING' && (
                                            <View className="flex-row justify-between mt-4 space-x-3">
                                                <TouchableOpacity
                                                    className="flex-1 bg-rose-500 py-3 rounded-[16px] shadow-sm items-center active:scale-95"
                                                    onPress={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                                >
                                                    <Text className="text-white font-bold text-sm uppercase tracking-wide">Reject</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className="flex-1 bg-indigo-600 py-3 rounded-[16px] shadow-md shadow-indigo-300 items-center active:scale-95"
                                                    onPress={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                                >
                                                    <Text className="text-white font-bold text-sm uppercase tracking-wide">Accept</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        {booking.status === 'CONFIRMED' && (
                                            <View className="mt-4">
                                                <TouchableOpacity
                                                    className="w-full bg-emerald-600 py-3 rounded-[16px] shadow-md shadow-emerald-300 items-center active:scale-95"
                                                    onPress={() => updateBookingStatus(booking.id, 'COMPLETED')}
                                                >
                                                    <Text className="text-white font-bold text-sm uppercase tracking-wide">Mark Completed</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                    <View className="h-20"></View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
