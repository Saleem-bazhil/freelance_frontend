import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Animated, Easing } from 'react-native';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { MapPin, Briefcase, FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FreelancerProfileScreen() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // Editable fields
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [experience, setExperience] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/freelancer/me/');
            setProfile(res.data);
            setBio(res.data.bio || '');
            setLocation(res.data.location || '');
            setExperience(res.data.experience_years ? res.data.experience_years.toString() : '');
        } catch (err) {
            console.log('Error fetching profile', err);
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
            const res = await api.patch('/freelancer/me/', {
                bio,
                location,
                experience_years: parseInt(experience) || 0,
            });
            setProfile(res.data);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (err) {
            Alert.alert("Error", "Could not update profile");
        } finally {
            setSaving(false);
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
            <View className="px-6 flex-row justify-between items-center mb-6">
                <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">Profile</Text>
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
                    <View className="bg-white p-6 rounded-[32px] shadow-lg shadow-slate-200/50 border border-slate-50 items-center mb-8 relative overflow-hidden">
                        <View className="absolute top-0 left-0 w-32 h-32 bg-indigo-50/50 rounded-br-full -z-10" />
                        <View className="w-28 h-28 bg-indigo-100 rounded-[28px] items-center justify-center mb-5 border-[4px] border-white shadow-xl shadow-indigo-200/50">
                            <Text className="text-5xl text-indigo-700 font-extrabold">{user?.username?.[0].toUpperCase()}</Text>
                        </View>
                        <Text className="text-3xl font-extrabold text-slate-900 mb-2">{user?.username}</Text>
                        <View className="bg-indigo-50 px-4 py-1.5 rounded-lg border border-indigo-100">
                            <Text className="text-indigo-700 font-bold uppercase tracking-widest text-xs">Freelancer Account</Text>
                        </View>
                    </View>

                    <Text className="text-xl font-extrabold text-slate-900 mb-4 ml-1">Personal Details</Text>
                    <View className="bg-white p-6 rounded-[32px] shadow-lg shadow-slate-200/40 border border-slate-50 mb-8 space-y-6">

                        <View>
                            <Text className="text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-widest">Bio</Text>
                            <View className="bg-slate-50 rounded-2xl flex-row items-start px-4 py-4 border border-slate-200 shadow-sm shadow-slate-100 focus-within:border-indigo-500 focus-within:bg-indigo-50/30 transition-colors">
                                <FileText size={20} color="#64748b" className="mr-3 mt-0.5" />
                                <TextInput
                                    className="flex-1 text-slate-800 text-base font-medium min-h-[100px]"
                                    multiline
                                    numberOfLines={4}
                                    value={bio}
                                    onChangeText={setBio}
                                    placeholder="Tell clients about yourself..."
                                    placeholderTextColor="#94a3b8"
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-widest">Location</Text>
                            <View className="bg-slate-50 rounded-2xl flex-row items-center px-4 py-3 border border-slate-200 shadow-sm shadow-slate-100 focus-within:border-indigo-500 focus-within:bg-indigo-50/30 transition-colors">
                                <MapPin size={22} color="#64748b" className="mr-3" />
                                <TextInput
                                    className="flex-1 text-slate-800 text-base font-medium h-12"
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="e.g. New York, USA"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-widest">Experience (Years)</Text>
                            <View className="bg-slate-50 rounded-2xl flex-row items-center px-4 py-3 border border-slate-200 shadow-sm shadow-slate-100 focus-within:border-indigo-500 focus-within:bg-indigo-50/30 transition-colors">
                                <Briefcase size={22} color="#64748b" className="mr-3" />
                                <TextInput
                                    className="flex-1 text-slate-800 text-base font-medium h-12"
                                    value={experience}
                                    onChangeText={setExperience}
                                    placeholder="0"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>
                    <View className="h-10"></View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
