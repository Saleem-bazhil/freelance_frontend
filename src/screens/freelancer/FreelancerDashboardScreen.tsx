import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, Easing } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { signOut } from '../../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bell, Briefcase, DollarSign, LogOut, Star, TrendingUp, Award } from 'lucide-react-native';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FreelancerDashboardScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const fetchProfile = async () => {
        try {
            const res = await api.get('/freelancer/me/');
            setProfile(res.data);
        } catch (err) {
            console.log('Error fetching profile', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        dispatch(signOut());
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
            {/* Header */}
            <View
                className="bg-indigo-600 pb-8 px-6 rounded-b-[40px] shadow-xl shadow-indigo-300 z-10"
                style={{ paddingTop: Math.max(insets.top, 20) + 16 }}
            >
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Welcome back,</Text>
                        <Text className="text-white text-3xl font-extrabold tracking-tight">{user?.username || 'Freelancer'}</Text>
                    </View>
                    <View className="flex-row space-x-3">
                        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="bg-indigo-500/50 p-2.5 rounded-2xl border border-indigo-400/50 active:scale-95 transition-transform">
                            <Bell color="white" size={22} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} className="bg-indigo-500/50 p-2.5 rounded-2xl border border-indigo-400/50 active:scale-95 transition-transform">
                            <LogOut color="white" size={22} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-8"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* Stats Overview */}
                    <Text className="text-xl font-extrabold text-slate-900 mb-5 ml-1">Overview</Text>
                    <View className="flex-row justify-between mb-8 space-x-4">
                        <View className="flex-1 bg-white p-5 rounded-[28px] shadow-md shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                            <View className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-[40px] -z-10" />
                            <View className="w-12 h-12 bg-emerald-100/50 rounded-2xl items-center justify-center mb-4 border border-emerald-100">
                                <TrendingUp size={22} color="#10b981" />
                            </View>
                            <Text className="text-3xl font-black text-slate-800 tracking-tighter">${profile?.total_earnings || '0.00'}</Text>
                            <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1.5">Total Earnings</Text>
                        </View>

                        <View className="flex-1 bg-white p-5 rounded-[28px] shadow-md shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                            <View className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-[40px] -z-10" />
                            <View className="w-12 h-12 bg-amber-100/50 rounded-2xl items-center justify-center mb-4 border border-amber-100">
                                <Award size={22} color="#f59e0b" />
                            </View>
                            <Text className="text-3xl font-black text-slate-800 tracking-tighter">{profile?.quality_score || 'N/A'}</Text>
                            <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1.5">Quality Score</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <Text className="text-xl font-extrabold text-slate-900 mb-5 ml-1">Quick Actions</Text>
                    <View className="bg-white rounded-[32px] p-2 shadow-lg shadow-slate-200/40 border border-slate-50 mb-8">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('FreelancerBookings')}
                            className="flex-row items-center p-4 border-b border-slate-50 active:bg-slate-50/50 transition-colors rounded-t-[24px]"
                        >
                            <View className="w-12 h-12 bg-indigo-50 rounded-[18px] items-center justify-center mr-4 border border-indigo-100/50">
                                <Briefcase size={22} color="#4f46e5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-slate-800">Booking Requests</Text>
                                <Text className="text-slate-500 text-sm font-medium mt-0.5">Manage incoming jobs</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center p-4 active:bg-slate-50/50 transition-colors rounded-b-[24px]">
                            <View className="w-12 h-12 bg-indigo-50 rounded-[18px] items-center justify-center mr-4 border border-indigo-100/50">
                                <Star size={22} color="#4f46e5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-slate-800">Recent Reviews</Text>
                                <Text className="text-slate-500 text-sm font-medium mt-0.5">Check what clients are saying</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View className="h-10"></View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
