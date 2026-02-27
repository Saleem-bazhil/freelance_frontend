import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import api from '../../services/api';
import { MessageSquare, User, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatListScreen() {
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<any[]>([]);
    const navigation = useNavigation<any>();
    const { role } = useSelector((state: RootState) => state.auth);
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/chat/rooms/');
            setRooms(res.data.results || res.data);
        } catch (err) {
            console.log('Error fetching chat rooms', err);
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
                <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">Messages</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {rooms.length === 0 ? (
                        <View className="items-center justify-center py-24 px-4 bg-white rounded-[32px] border border-slate-100 shadow-sm shadow-slate-100 mt-4">
                            <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6 border border-indigo-100/50">
                                <MessageSquare size={44} color="#6366f1" strokeWidth={1.5} />
                            </View>
                            <Text className="text-2xl font-extrabold text-slate-900 mb-2">No messages yet</Text>
                            <Text className="text-slate-500 text-center font-medium leading-relaxed px-4">When you chat with creatives, your conversations will appear here.</Text>
                        </View>
                    ) : (
                        rooms.map((room, index) => {
                            // Determine the display name based on current user role
                            const displayName = role === 'CLIENT'
                                ? room.freelancer_detail?.user?.username || 'Freelancer'
                                : room.client_detail?.user?.username || 'Client';

                            const lastMessage = room.last_message || 'No messages yet...';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => navigation.navigate('ChatDetail', { room_id: room.id, displayName })}
                                    className="bg-white rounded-[24px] p-4 mb-4 shadow-md shadow-slate-200/50 border border-slate-50 flex-row items-center active:scale-[0.98] transition-transform"
                                >
                                    <View className="w-16 h-16 bg-indigo-100/50 rounded-[20px] items-center justify-center mr-4 border border-indigo-100">
                                        <Text className="text-2xl text-indigo-700 font-extrabold">{displayName[0].toUpperCase()}</Text>
                                    </View>
                                    <View className="flex-1 justify-center">
                                        <View className="flex-row justify-between items-center mb-1.5">
                                            <Text className="text-lg font-extrabold text-slate-900">{displayName}</Text>
                                            <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Just now</Text>
                                        </View>
                                        <Text className="text-slate-500 text-sm font-medium truncate" numberOfLines={1}>{lastMessage}</Text>
                                    </View>
                                    <View className="ml-3">
                                        <ChevronRight size={20} color="#cbd5e1" />
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    )}
                    <View className="h-20"></View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
