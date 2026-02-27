import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput, Animated, Easing } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { signOut } from '../../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { User, MapPin, Bell, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClientProfileScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // Editable
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/profile/');
            setProfile(res.data);
            setAddress(res.data.address || '');
        } catch (err) {
            console.log('Error fetching client profile', err);
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

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/user/profile/', { address });
            Alert.alert("Success", "Profile updated successfully!");
        } catch (err) {
            Alert.alert("Error", "Could not update profile");
        } finally {
            setSaving(false);
        }
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
        <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 20) + 16 }}>
            <View className="px-6 flex-row justify-between items-center mb-6">
                <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">My Profile</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 px-6 py-2.5 rounded-xl shadow-md shadow-indigo-300 active:scale-95 transition-transform"
                >
                    {saving ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold text-base">Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* Profile Card */}
                    <View className="bg-white p-6 rounded-[32px] shadow-lg shadow-slate-200/50 border border-slate-50 items-center mb-8 relative overflow-hidden">
                        <View className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-10" />
                        <View className="w-28 h-28 bg-indigo-50 rounded-[28px] items-center justify-center mb-5 border-[4px] border-white shadow-xl shadow-indigo-100/50">
                            <Text className="text-5xl text-indigo-700 font-extrabold">{user?.username?.[0].toUpperCase()}</Text>
                        </View>
                        <Text className="text-3xl font-extrabold text-slate-900 mb-2">{user?.username}</Text>
                        <View className="bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-100">
                            <Text className="text-emerald-700 font-bold uppercase tracking-widest text-xs">Client Account</Text>
                        </View>

                        <View className="w-full mt-8 space-y-4">
                            <View>
                                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">Billing Address / Location</Text>
                                <View className="bg-slate-50 rounded-2xl flex-row items-center px-4 py-3.5 border border-slate-200 shadow-sm shadow-slate-100 focus-within:border-indigo-500 focus-within:bg-indigo-50/30 transition-colors">
                                    <MapPin size={22} color="#64748b" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-slate-800 text-base font-medium"
                                        value={address}
                                        onChangeText={setAddress}
                                        placeholder="e.g. 123 Main St, City, Country"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Settings List */}
                    <Text className="text-xl font-extrabold text-slate-900 mb-4 ml-1">Settings</Text>
                    <View className="bg-white rounded-[28px] p-2 shadow-sm shadow-slate-200 border border-slate-50 mb-8">
                        <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50 active:bg-slate-50/50 transition-colors rounded-t-[20px]">
                            <View className="w-12 h-12 bg-indigo-50 rounded-[18px] items-center justify-center mr-4">
                                <User size={22} color="#4f46e5" />
                            </View>
                            <Text className="flex-1 text-lg font-bold text-slate-800">Account Details</Text>
                            <ChevronRight size={22} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="flex-row items-center p-4 border-b border-slate-50 active:bg-slate-50/50 transition-colors">
                            <View className="w-12 h-12 bg-indigo-50 rounded-[18px] items-center justify-center mr-4">
                                <Bell size={22} color="#4f46e5" />
                            </View>
                            <Text className="flex-1 text-lg font-bold text-slate-800">Notifications</Text>
                            <ChevronRight size={22} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center p-4 active:bg-slate-50/50 transition-colors rounded-b-[20px]">
                            <View className="w-12 h-12 bg-indigo-50 rounded-[18px] items-center justify-center mr-4">
                                <Shield size={22} color="#4f46e5" />
                            </View>
                            <Text className="flex-1 text-lg font-bold text-slate-800">Privacy & Security</Text>
                            <ChevronRight size={22} color="#cbd5e1" />
                        </TouchableOpacity>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-rose-50 rounded-[24px] flex-row items-center justify-center py-5 border border-rose-100 shadow-sm shadow-rose-100 mb-10 active:scale-95 transition-transform"
                    >
                        <LogOut size={22} color="#e11d48" className="mr-2" />
                        <Text className="text-rose-600 font-bold text-lg tracking-wide">Sign Out</Text>
                    </TouchableOpacity>
                    <View className="h-10" />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

