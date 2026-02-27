import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView, Animated, Easing } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { signIn } from '../../store/slices/authSlice';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Lock, Camera, Briefcase, UserCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'CLIENT' | 'FREELANCER'>('CLIENT');
    const [loading, setLoading] = useState(false);

    // UI states
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, slideAnim]);

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/user/register/', { username, password, role });
            const { access, refresh, user } = response.data;

            // Save to async storage
            await AsyncStorage.setItem('accessToken', access);
            await AsyncStorage.setItem('refreshToken', refresh);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('userRole', role);

            // Update Redux
            dispatch(signIn({ token: access, user, role }));
        } catch (error: any) {
            // Show first error message from backend if available
            const errorMsg = error.response?.data ? Object.values(error.response.data)[0] : 'Registration failed. Please try again.';
            Alert.alert('Registration Failed', Array.isArray(errorMsg) ? errorMsg[0] : String(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ flex: 1, paddingTop: Math.max(insets.top, 20) + 16, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="px-8 rounded-t-[40px]">
                    {/* Header Section */}
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-indigo-600 rounded-[24px] items-center justify-center mb-5 shadow-xl shadow-indigo-300">
                            <Camera size={36} color="white" strokeWidth={1.5} />
                        </View>
                        <Text className="text-4xl font-extrabold text-slate-900 tracking-tight text-center">
                            Join LensLink
                        </Text>
                        <Text className="text-base text-slate-500 mt-2 text-center font-medium">
                            Create an account to get started.
                        </Text>
                    </View>

                    {/* Role Selection */}
                    <Text className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">I am a...</Text>
                    <View className="flex-row justify-between mb-8 space-x-4">
                        <TouchableOpacity
                            onPress={() => setRole('CLIENT')}
                            className={`flex-1 items-center justify-center py-4 rounded-2xl border-2 ${role === 'CLIENT' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}
                        >
                            <UserCircle size={28} color={role === 'CLIENT' ? '#4f46e5' : '#94a3b8'} className="mb-2" />
                            <Text className={`font-bold ${role === 'CLIENT' ? 'text-indigo-700' : 'text-slate-500'}`}>Client</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setRole('FREELANCER')}
                            className={`flex-1 items-center justify-center py-4 rounded-2xl border-2 ${role === 'FREELANCER' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}
                        >
                            <Briefcase size={28} color={role === 'FREELANCER' ? '#4f46e5' : '#94a3b8'} className="mb-2" />
                            <Text className={`font-bold ${role === 'FREELANCER' ? 'text-indigo-700' : 'text-slate-500'}`}>Freelancer</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-4">
                        <View className={`bg-white rounded-2xl flex-row items-center px-4 py-2 border-2 transition-colors duration-200 ${isUsernameFocused ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 shadow-sm shadow-slate-100'}`}>
                            <User size={22} color={isUsernameFocused ? "#4f46e5" : "#94a3b8"} className="mr-3" />
                            <TextInput
                                className="flex-1 text-slate-800 text-base font-medium h-12"
                                placeholder="Choose a Username"
                                placeholderTextColor="#94a3b8"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                onFocus={() => setIsUsernameFocused(true)}
                                onBlur={() => setIsUsernameFocused(false)}
                            />
                        </View>

                        <View className={`bg-white rounded-2xl flex-row items-center px-4 py-2 border-2 mt-4 transition-colors duration-200 ${isPasswordFocused ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 shadow-sm shadow-slate-100'}`}>
                            <Lock size={22} color={isPasswordFocused ? "#4f46e5" : "#94a3b8"} className="mr-3" />
                            <TextInput
                                className="flex-1 text-slate-800 text-base font-medium h-12"
                                placeholder="Password"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            className="w-full bg-indigo-600 rounded-2xl py-4 items-center mt-8 shadow-xl shadow-indigo-300 active:scale-95 transition-transform"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg tracking-wide">Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-12 items-center">
                        <Text className="text-slate-500 text-base font-medium">Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-indigo-600 font-extrabold text-base ml-1">Sign in</Text>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
