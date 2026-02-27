import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Animated, Easing } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Star, MapPin, CheckCircle, MessageSquare, Calendar as CalendarIcon, Award, Camera } from 'lucide-react-native';
import api from '../../services/api';

export default function FreelancerDetailsScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;

    const [loading, setLoading] = useState(true);
    const [freelancer, setFreelancer] = useState<any>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/freelancer/${id}/`);
            setFreelancer(res.data);
        } catch (err) {
            console.log('Error fetching freelancer details', err);
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

    if (!freelancer) return null;

    return (
        <View className="flex-1 bg-slate-50">
            {/* Dynamic Header / Hero Avatar */}
            <View className="h-72 bg-indigo-600 rounded-b-[48px] pt-14 px-4 shadow-xl shadow-indigo-300/50 items-center overflow-hidden z-10">
                <View className="absolute inset-0 bg-indigo-700/20" />
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="absolute top-14 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full items-center justify-center z-20"
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>

                <View className="w-28 h-28 bg-white rounded-[32px] items-center justify-center mt-6 shadow-2xl shadow-black/20 border-[6px] border-indigo-400/30">
                    <Text className="text-5xl text-indigo-700 font-extrabold">{freelancer.user.username[0].toUpperCase()}</Text>
                </View>
                <Text className="text-3xl font-extrabold text-white mt-4 tracking-tight">{freelancer.user.username}</Text>
                <View className="flex-row items-center mt-2 bg-indigo-500/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-indigo-400/30">
                    <MapPin size={16} color="#e0e7ff" />
                    <Text className="text-indigo-50 font-semibold ml-1.5">{freelancer.location || 'Remote'}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 -mt-8 pt-10" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* Stats Card */}
                    <View className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-50 flex-row justify-around mb-8">
                        <View className="items-center">
                            <Text className="text-3xl font-extrabold text-slate-900">{freelancer.quality_score}</Text>
                            <View className="flex-row items-center mt-1.5">
                                <Star size={16} color="#f59e0b" fill="#f59e0b" className="mr-1.5" />
                                <Text className="text-slate-600 font-bold text-xs uppercase tracking-wider">Rating</Text>
                            </View>
                        </View>
                        <View className="w-[1px] bg-slate-100" />
                        <View className="items-center">
                            <Text className="text-3xl font-extrabold text-slate-900">{freelancer.experience_years || 0}</Text>
                            <View className="flex-row items-center mt-1.5">
                                <Award size={16} color="#10b981" className="mr-1.5" />
                                <Text className="text-slate-600 font-bold text-xs uppercase tracking-wider">Years Exp.</Text>
                            </View>
                        </View>
                        <View className="w-[1px] bg-slate-100" />
                        <View className="items-center">
                            <Text className="text-3xl font-extrabold text-indigo-700">${freelancer.pricing_packages?.[0]?.price || 'N/A'}</Text>
                            <Text className="text-slate-600 font-bold text-xs mt-1.5 uppercase tracking-wider">Starting</Text>
                        </View>
                    </View>

                    {/* Bio */}
                    <Text className="text-2xl font-extrabold text-slate-900 mb-4 ml-1">About</Text>
                    <View className="bg-white p-6 rounded-[28px] shadow-sm shadow-slate-200/50 border border-slate-50 mb-8">
                        <Text className="text-slate-600 leading-loose text-base font-medium">
                            {freelancer.bio || 'This freelancer hasn\'t provided a bio yet. They are ready to bring your vision to life.'}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-between space-x-4 mb-10">
                        <TouchableOpacity
                            className="flex-1 bg-white rounded-2xl py-4 flex-row justify-center items-center shadow-md shadow-slate-200 border border-slate-100 active:scale-95 transition-transform"
                            onPress={() => Alert.alert('Message', 'Chat feature coming soon!')}
                        >
                            <MessageSquare size={22} color="#475569" className="mr-2" />
                            <Text className="text-slate-700 font-bold text-lg">Message</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-indigo-600 rounded-2xl py-4 flex-row justify-center items-center shadow-xl shadow-indigo-300 active:scale-95 transition-transform"
                            onPress={() => navigation.navigate('BookingCheckout', { freelancer })}
                        >
                            <CalendarIcon size={22} color="white" className="mr-2" />
                            <Text className="text-white font-bold text-lg tracking-wide">Book Now</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Portfolio Preview */}
                    <View className="flex-row justify-between items-center mb-5 ml-1">
                        <Text className="text-2xl font-extrabold text-slate-900">Portfolio</Text>
                        <TouchableOpacity><Text className="text-indigo-600 font-bold">See All</Text></TouchableOpacity>
                    </View>

                    {freelancer.portfolio_items?.length > 0 ? (
                        <View className="flex-row flex-wrap justify-between gap-y-4">
                            {freelancer.portfolio_items.map((item: any, idx: number) => (
                                <View key={idx} className="w-[48%] bg-white p-2 rounded-[24px] shadow-sm shadow-slate-200 border border-slate-50">
                                    <Image
                                        source={{ uri: item.file }}
                                        className="w-full h-40 rounded-[18px]"
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="bg-white p-8 rounded-[28px] border border-slate-100 items-center justify-center border-dashed mb-4">
                            <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-3">
                                <Camera size={28} color="#94a3b8" />
                            </View>
                            <Text className="text-slate-500 font-semibold text-center">No portfolio items available yet.</Text>
                        </View>
                    )}
                    <View className="h-20"></View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

