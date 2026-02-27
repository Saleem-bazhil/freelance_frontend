import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { signIn } from '../../store/slices/authSlice';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, Camera } from 'lucide-react-native';

export default function LoginScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // UI states
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter both username and password.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/user/login/', { username, password });
            const { access, refresh, user, role } = response.data;

            // Save to async storage
            await AsyncStorage.setItem('accessToken', access);
            await AsyncStorage.setItem('refreshToken', refresh);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('userRole', role);

            // Update Redux
            dispatch(signIn({ token: access, user, role }));
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <View className="flex-1 justify-center px-8 pb-12 rounded-t-[40px]">
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* Header Section */}
                    <View className="items-center mb-12 mt-10">
                        <View className="w-24 h-24 bg-indigo-600 rounded-[28px] items-center justify-center mb-6 shadow-xl shadow-indigo-300">
                            <Camera size={44} color="white" strokeWidth={1.5} />
                        </View>
                        <Text className="text-4xl font-extrabold text-slate-900 tracking-tight text-center">
                            LensLink
                        </Text>
                        <Text className="text-base text-slate-500 mt-3 text-center font-medium">
                            Find the perfect creative for your next project.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-4">
                        <View className={`bg-white rounded-2xl flex-row items-center px-4 py-2 border-2 transition-colors duration-200 ${isUsernameFocused ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 shadow-sm shadow-slate-100'}`}>
                            <Mail size={22} color={isUsernameFocused ? "#4f46e5" : "#94a3b8"} className="mr-3" />
                            <TextInput
                                className="flex-1 text-slate-800 text-base font-medium h-12"
                                placeholder="Username or Email"
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

                        <TouchableOpacity className="mt-4 mb-2">
                            <Text className="text-indigo-600 font-bold text-right text-sm">Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className="w-full bg-indigo-600 rounded-2xl py-4 items-center mt-6 shadow-xl shadow-indigo-300"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg tracking-wide">Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-12 items-center">
                        <Text className="text-slate-500 text-base font-medium">New around here? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text className="text-indigo-600 font-extrabold text-base ml-1">Create an account</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}
