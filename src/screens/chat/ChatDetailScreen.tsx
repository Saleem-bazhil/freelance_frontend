import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Send } from 'lucide-react-native';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { room_id, displayName } = route.params;

    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useSelector((state: RootState) => state.auth);
    const ws = useRef<WebSocket | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchMessages();
        setupWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/chat/messages/?room=${room_id}`);
            setMessages(res.data.results || res.data);
        } catch (err) {
            console.log('Error fetching messages', err);
        } finally {
            setLoading(false);
        }
    };

    const setupWebSocket = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const wsUrl = `ws://10.0.2.2:8000/ws/chat/${room_id}/?token=${token}`; // Assuming your routing is set this way, usually auth is complex for WS

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket Connected');
            };

            ws.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.message) {
                    // Append message from WS. Ensure the structure aligns with the REST API.
                    const incomingMessage = {
                        id: Date.now(), // Temporary ID
                        text_content: data.message,
                        sender: data.sender_id || 0, // Need sender ID to style correctly
                        sender_detail: { id: data.sender_id, user: { username: data.sender || 'User' } },
                        timestamp: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, incomingMessage]);
                }
            };

            ws.current.onerror = (e) => {
                console.log('WebSocket Error:', e);
            };

            ws.current.onclose = () => {
                console.log('WebSocket Disconnected');
            };
        } catch (e) {
            console.log('Error setting up WS', e);
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !ws.current) return;

        ws.current.send(JSON.stringify({
            message: newMessage
        }));

        // Optimistically add message
        const tempMessage = {
            id: Date.now(),
            text_content: newMessage,
            sender: user.id,
            sender_detail: { id: user.id, user: { username: user.username } },
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            {/* Header */}
            <View
                className="bg-white/95 backdrop-blur-md pb-4 px-4 shadow-sm shadow-slate-200/50 border-b border-slate-100 flex-row items-center z-10"
                style={{ paddingTop: Math.max(insets.top, 20) + 16 }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 rounded-full items-center justify-center mr-2 active:bg-slate-100 transition-colors"
                >
                    <ArrowLeft color="#4f46e5" size={24} />
                </TouchableOpacity>
                <View className="w-10 h-10 bg-indigo-100/80 rounded-[14px] items-center justify-center mr-3 border border-indigo-200/50 shadow-sm shadow-indigo-100">
                    <Text className="text-lg text-indigo-700 font-extrabold">{displayName[0].toUpperCase()}</Text>
                </View>
                <Text className="text-xl font-extrabold text-slate-900 flex-1 truncate">{displayName}</Text>
            </View>

            <ScrollView
                className="flex-1 px-4 py-6"
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
            >
                {messages.length === 0 ? (
                    <View className="items-center justify-center py-10 opacity-70">
                        <Text className="text-slate-500 font-medium">No messages yet. Say hi!</Text>
                    </View>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === user.id || msg.sender_detail?.user?.id === user.id || msg.sender_detail?.id === user.id;

                        return (
                            <View key={idx} className={`w-full mb-5 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <View className={`max-w-[75%] px-5 py-3.5 shadow-sm ${isMe ? 'bg-indigo-600 rounded-[24px] rounded-br-[8px] shadow-indigo-300/50' : 'bg-white border border-slate-100 shadow-slate-200/50 rounded-[24px] rounded-bl-[8px]'}`}>
                                    <Text className={`${isMe ? 'text-white' : 'text-slate-800'} text-base font-medium leading-relaxed`}>
                                        {msg.text_content}
                                    </Text>
                                    <Text className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                )}
                <View className="h-6"></View>
            </ScrollView>

            {/* Input Form */}
            <View className="bg-white px-4 py-3 border-t border-slate-100 flex-row items-center pb-8 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] rounded-t-[32px]">
                <TextInput
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-6 py-3.5 text-slate-800 text-base font-medium mr-3 focus-within:border-indigo-300 focus-within:bg-indigo-50/20 transition-colors"
                    placeholder="Type a message..."
                    placeholderTextColor="#94a3b8"
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity
                    onPress={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`w-12 h-12 rounded-full items-center justify-center shadow-md active:scale-95 transition-transform ${!newMessage.trim() ? 'bg-indigo-200 shadow-none' : 'bg-indigo-600 shadow-indigo-300'}`}
                >
                    <Send size={20} color="white" className="ml-0.5" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
