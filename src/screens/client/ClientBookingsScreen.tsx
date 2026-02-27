import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Easing } from 'react-native';
import api from '../../services/api';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClientBookingsScreen() {
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
            console.log('Error fetching bookings', err);
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
        <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 20) + 16 }}>
            <View className="px-6 mb-8 flex-row justify-between items-center">
                <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">My Bookings</Text>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {bookings.length === 0 ? (
                        <View className="items-center justify-center py-24 px-4">
                            <View className="w-28 h-28 bg-white rounded-full items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <CalendarIcon size={48} color="#94a3b8" strokeWidth={1.5} />
                            </View>
                            <Text className="text-2xl font-extrabold text-slate-900 mb-3 text-center">No active bookings</Text>
                            <Text className="text-slate-500 text-center text-base font-medium leading-relaxed">You haven't booked any creatives yet. Discover amazing talent on the home screen.</Text>
                        </View>
                    ) : (
                        bookings.map((booking, index) => {
                            const statusStyle = getStatusColor(booking.status);
                            return (
                                <TouchableOpacity key={index} className="bg-white rounded-[28px] p-5 mb-5 shadow-lg shadow-slate-200/40 border border-slate-50 active:scale-[0.98] transition-all">
                                    <View className="flex-row justify-between flex-wrap gap-2 items-start mb-5">
                                        <View className="flex-1">
                                            <Text className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1.5">Freelancer</Text>
                                            <Text className="text-2xl font-extrabold text-slate-900 tracking-tight">{booking.freelancer_detail?.user?.username || `Freelancer #${booking.freelancer}`}</Text>
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
                                            <Text className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Amount</Text>
                                            <Text className="text-indigo-700 font-black text-xl">${booking.total_amount}</Text>
                                        </View>

                                        {booking.status === 'COMPLETED' && (
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('AddReview', { bookingId: booking.id, freelancerName: booking.freelancer_detail?.user?.username || 'Freelancer' })}
                                                className="mt-4 bg-indigo-600 py-3 rounded-[16px] shadow-md shadow-indigo-300 items-center justify-center active:scale-95 transition-transform"
                                            >
                                                <Text className="text-white font-bold text-base tracking-wide text-center">Leave a Review</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                    <View className="h-20"></View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

