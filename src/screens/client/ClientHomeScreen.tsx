import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Image, Animated, Easing } from 'react-native';
import { Search, MapPin, Camera, Star } from 'lucide-react-native';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClientHomeScreen() {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [freelancersRes, categoriesRes] = await Promise.all([
                api.get('/freelancer/list/'),
                api.get('/freelancer/categories/')
            ]);
            setFreelancers(freelancersRes.data.results || freelancersRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.log('Error fetching data', err);
        } finally {
            setLoading(false);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                })
            ]).start();
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
            {/* Dynamic Header */}
            <View
                className="bg-indigo-600 pb-8 px-6 rounded-b-[40px] shadow-xl shadow-indigo-300 z-10"
                style={{ paddingTop: Math.max(insets.top, 20) + 16 }}
            >
                <Text className="text-indigo-100/90 text-base font-semibold mb-1 uppercase tracking-wider">Find your perfect creative.</Text>
                <Text className="text-white text-4xl font-extrabold tracking-tight mb-6">Discover amazing{'\n'}Photographers</Text>

                {/* Search Bar */}
                <View className="bg-white/95 backdrop-blur-md rounded-2xl flex-row items-center px-4 py-3 shadow-sm shadow-slate-300">
                    <Search size={22} color="#64748b" className="mr-3" />
                    <TextInput
                        className="flex-1 text-slate-800 text-lg font-medium"
                        placeholder="Search by name or category..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity className="bg-indigo-600 p-2.5 rounded-xl shadow-sm shadow-indigo-200 active:scale-95 transition-transform">
                        <Search size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* Categories Horizontal List */}
                    <View className="mb-8">
                        <View className="px-6 flex-row justify-between items-center mb-4">
                            <Text className="text-2xl font-extrabold text-slate-900">Categories</Text>
                            <TouchableOpacity><Text className="text-indigo-600 font-bold text-base">See All</Text></TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6 pb-2">
                            <TouchableOpacity className="items-center mr-6">
                                <View className="w-16 h-16 rounded-[20px] border-2 border-indigo-600 bg-indigo-50/50 items-center justify-center mb-3 shadow-md shadow-indigo-100">
                                    <Camera size={26} color="#4f46e5" />
                                </View>
                                <Text className="text-indigo-800 font-bold text-sm tracking-wide">All</Text>
                            </TouchableOpacity>

                            {categories.map((cat, index) => (
                                <TouchableOpacity key={index} className="items-center mr-6">
                                    <View className="w-16 h-16 rounded-[20px] bg-white border border-slate-100 items-center justify-center mb-3 shadow-sm shadow-slate-200">
                                        <Camera size={26} color="#64748b" />
                                    </View>
                                    <Text className="text-slate-600 font-bold text-sm tracking-wide">{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Featured Freelancers */}
                    <View className="px-6 mb-8">
                        <Text className="text-2xl font-extrabold text-slate-900 mb-5">Featured Freelancers</Text>

                        {freelancers.map((freelancer, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => navigation.navigate('FreelancerDetails', { id: freelancer.id })}
                                className="bg-white rounded-[28px] p-5 mb-5 shadow-lg shadow-slate-200/50 border border-slate-50 flex-row active:scale-[0.98] transition-all"
                            >
                                <View className="w-24 h-24 bg-indigo-50 rounded-[20px] items-center justify-center mr-5 border border-indigo-100">
                                    <Text className="text-3xl text-indigo-700 font-extrabold">{freelancer.user.username[0].toUpperCase()}</Text>
                                </View>

                                <View className="flex-1 justify-center space-y-1">
                                    <View className="flex-row justify-between items-start">
                                        <Text className="text-xl font-extrabold text-slate-900 flex-1 truncate">{freelancer.user.username}</Text>
                                        <View className="flex-row items-center bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-100">
                                            <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                            <Text className="text-amber-800 font-bold text-xs ml-1.5">{freelancer.quality_score}</Text>
                                        </View>
                                    </View>

                                    <Text className="text-slate-500 text-sm font-medium mb-1 truncate" numberOfLines={1}>{freelancer.bio || 'Professional Photographer'}</Text>

                                    <View className="flex-row items-center pt-2">
                                        <MapPin size={16} color="#94a3b8" />
                                        <Text className="text-slate-500 text-sm font-medium ml-1.5 truncate flex-1">{freelancer.location || 'Remote'}</Text>
                                        <View className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                            <Text className="text-emerald-700 font-extrabold text-sm">${freelancer.pricing_packages?.[0]?.price || '100'}/hr</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {freelancers.length === 0 && (
                            <View className="items-center py-10">
                                <Text className="text-slate-500">No freelancers found.</Text>
                            </View>
                        )}
                    </View>
                    <View className="h-20"></View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
