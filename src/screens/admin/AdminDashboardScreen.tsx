import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { signOut } from '../../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, Briefcase, DollarSign, LogOut, TrendingUp, UserCheck, Calendar } from 'lucide-react-native';
import api from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminDashboardScreen() {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/admin_dashboard/analytics/');
            setData(res.data);
        } catch (err) {
            console.log('Error fetching analytics', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
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
                className="bg-slate-900 pb-6 px-6 rounded-b-[32px] shadow-lg shadow-slate-400"
                style={{ paddingTop: Math.max(insets.top, 20) + 16 }}
            >
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 text-sm font-medium uppercase tracking-wider">Superadmin</Text>
                        <Text className="text-white text-3xl font-bold mt-1">Platform Analytics</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} className="bg-slate-800 p-2 rounded-full border border-slate-700">
                        <LogOut color="white" size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Financial Highlights */}
                <Text className="text-lg font-bold text-slate-800 mb-4">Financial Overview</Text>
                <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm shadow-slate-200 border border-slate-100 items-center justify-center">
                    <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3">
                        <DollarSign size={32} color="#10b981" />
                    </View>
                    <Text className="text-4xl font-extrabold text-slate-900">${data?.financials?.platform_commission_earnings?.toFixed(2) || '0.00'}</Text>
                    <Text className="text-slate-500 font-medium text-sm mt-1 mb-4">Total Platform Revenue (10% Cut)</Text>

                    <View className="w-full h-[1px] bg-slate-100 mb-4" />

                    <View className="flex-row items-center w-full justify-between">
                        <Text className="text-slate-600 font-medium">Gross Transaction Volume</Text>
                        <Text className="text-indigo-700 font-bold text-lg">${data?.financials?.total_transaction_volume?.toFixed(2) || '0.00'}</Text>
                    </View>
                </View>

                {/* User Stats */}
                <Text className="text-lg font-bold text-slate-800 mb-4">User Base</Text>
                <View className="flex-row justify-between mb-8 space-x-4">
                    <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm shadow-slate-200 border border-slate-100 items-center">
                        <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mb-3">
                            <Users size={20} color="#4f46e5" />
                        </View>
                        <Text className="text-3xl font-extrabold text-slate-800">{data?.users?.clients || 0}</Text>
                        <Text className="text-slate-500 font-medium text-sm mt-1">Clients</Text>
                    </View>

                    <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm shadow-slate-200 border border-slate-100 items-center">
                        <View className="w-10 h-10 bg-violet-100 rounded-full items-center justify-center mb-3">
                            <Briefcase size={20} color="#8b5cf6" />
                        </View>
                        <Text className="text-3xl font-extrabold text-slate-800">{data?.users?.freelancers || 0}</Text>
                        <Text className="text-slate-500 font-medium text-sm mt-1">Freelancers</Text>
                    </View>
                </View>

                {/* Booking Stats */}
                <Text className="text-lg font-bold text-slate-800 mb-4">Gig Activity</Text>
                <View className="flex-row justify-between mb-8 space-x-4">
                    <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm shadow-slate-200 border border-slate-100 pl-6">
                        <View className="w-10 h-10 bg-cyan-100 rounded-lg items-center justify-center mb-3">
                            <Calendar size={20} color="#06b6d4" />
                        </View>
                        <Text className="text-3xl font-extrabold text-slate-800">{data?.bookings?.total || 0}</Text>
                        <Text className="text-slate-500 font-medium text-sm mt-1">Total Bookings</Text>
                    </View>

                    <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm shadow-slate-200 border border-slate-100 pl-6">
                        <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center mb-3">
                            <UserCheck size={20} color="#10b981" />
                        </View>
                        <Text className="text-3xl font-extrabold text-slate-800">{data?.bookings?.completed || 0}</Text>
                        <Text className="text-slate-500 font-medium text-sm mt-1">Completed</Text>
                    </View>
                </View>

                <View className="h-10"></View>
            </ScrollView>
        </View>
    );
}
