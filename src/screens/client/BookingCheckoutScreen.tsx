import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Calendar as CalendarIcon, Clock, CreditCard, Receipt } from 'lucide-react-native';
import api from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingCheckoutScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { freelancer } = route.params;

    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const insets = useSafeAreaInsets();

    const handleBooking = async () => {
        if (!address) {
            Alert.alert('Details Required', 'Please provide a location for the booking.');
            return;
        }
        setLoading(true);
        try {
            const start = new Date();
            start.setDate(start.getDate() + 2); // Book 2 days from now
            const end = new Date(start);
            end.setHours(end.getHours() + 2);

            const payload = {
                freelancer: freelancer.id,
                package: freelancer.pricing_packages?.[0]?.id || null,
                start_datetime: start.toISOString(),
                end_datetime: end.toISOString(),
                location: address,
                notes: notes,
                total_amount: freelancer.pricing_packages?.[0]?.price || '150.00'
            };

            await api.post('/booking/bookings/', payload);
            Alert.alert('Booking Requested!', 'The freelancer will review your request shortly.', [
                { text: 'OK', onPress: () => navigation.navigate('ClientTabs', { screen: 'Bookings' }) }
            ]);
        } catch (error: any) {
            console.log('Booking error:', error.response?.data || error);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Failed to create booking request.';
            Alert.alert('Error 400', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View
                className="bg-white pb-5 px-6 shadow-sm shadow-slate-200 border-b border-slate-100 flex-row items-center z-10"
                style={{ paddingTop: Math.max(insets.top, 20) + 16 }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center mr-4 border border-slate-100"
                >
                    <ArrowLeft color="#475569" size={24} />
                </TouchableOpacity>
                <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6 pb-32" showsVerticalScrollIndicator={false}>
                {/* Booking Summary */}
                <Text className="text-xl font-extrabold text-slate-900 mb-4 ml-1">Summary</Text>
                <View className="bg-white p-6 rounded-[28px] shadow-md shadow-slate-200/40 border border-slate-100 mb-8 relative overflow-hidden">
                    <View className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-10" />
                    <View className="flex-row items-center border-b border-slate-100 pb-5 mb-5">
                        <View className="w-14 h-14 bg-indigo-100 rounded-[20px] items-center justify-center mr-4 border border-indigo-200/50">
                            <Text className="text-2xl text-indigo-700 font-extrabold">{freelancer.user.username[0].toUpperCase()}</Text>
                        </View>
                        <View>
                            <Text className="font-extrabold text-slate-900 text-xl">{freelancer.user.username}</Text>
                            <Text className="text-slate-500 font-medium text-sm mt-0.5">Freelance Creative</Text>
                        </View>
                    </View>

                    <View className="space-y-4">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-slate-500 font-medium">Service Fee (Base)</Text>
                            <Text className="text-slate-900 font-bold">${freelancer.pricing_packages?.[0]?.price || '150.00'}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-slate-500 font-medium">Platform Fee</Text>
                            <Text className="text-slate-900 font-bold">$15.00</Text>
                        </View>

                        {/* Cut-out circles simulating a receipt */}
                        <View className="relative h-2 my-2 flex-row items-center justify-between px-2">
                            <View className="h-[1px] flex-1 border-t border-dashed border-slate-200" />
                        </View>

                        <View className="flex-row justify-between items-end">
                            <Text className="text-slate-800 font-extrabold text-lg">Total Due</Text>
                            <Text className="text-indigo-600 font-black text-3xl tracking-tighter">${parseFloat(freelancer.pricing_packages?.[0]?.price || '150') + 15}</Text>
                        </View>
                    </View>
                </View>

                {/* Details Form */}
                <Text className="text-xl font-extrabold text-slate-900 mb-4 ml-1">Event Details</Text>
                <View className="space-y-5 mb-8">
                    <View>
                        <Text className="text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">Location</Text>
                        <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 border border-slate-200 shadow-sm shadow-slate-100">
                            <MapPin size={22} color="#4f46e5" className="mr-3" />
                            <TextInput
                                className="flex-1 text-slate-800 text-base font-medium min-h-[44px]"
                                placeholder="Where is the shoot?"
                                placeholderTextColor="#94a3b8"
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">Special Requirements</Text>
                        <View className="bg-white rounded-2xl flex-row items-start px-4 py-3 border border-slate-200 shadow-sm shadow-slate-100">
                            <TextInput
                                className="flex-1 text-slate-800 text-base font-medium min-h-[100px]"
                                placeholder="Any notes for the creative?"
                                placeholderTextColor="#94a3b8"
                                multiline
                                numberOfLines={4}
                                value={notes}
                                onChangeText={setNotes}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Automated Date Note */}
                    <View className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-100/50 flex-row mt-3 items-center">
                        <View className="bg-indigo-100 w-10 h-10 rounded-full items-center justify-center mr-4">
                            <Clock size={20} color="#4f46e5" />
                        </View>
                        <Text className="flex-1 text-indigo-800 text-sm font-semibold leading-relaxed">
                            For this demo, shoot dates will be automatically scheduled 2 days from today.
                        </Text>
                    </View>
                </View>
                <View className="h-10" />
            </ScrollView>

            {/* Floating Checkout Bar */}
            <View className="absolute bottom-0 w-full bg-white px-6 py-5 border-t border-slate-100 shadow-[0_-20px_40px_rgba(0,0,0,0.06)] flex-row justify-between items-center rounded-t-[32px]">
                <View className="pl-2">
                    <Text className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Cost</Text>
                    <Text className="text-3xl font-black text-slate-900 tracking-tighter">${parseFloat(freelancer.pricing_packages?.[0]?.price || '150') + 15}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleBooking}
                    disabled={loading}
                    className="bg-indigo-600 px-8 py-5 rounded-2xl flex-row justify-center items-center shadow-xl shadow-indigo-300 w-[55%] active:scale-95 transition-transform"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-extrabold text-lg mr-2 tracking-wide">Confirm</Text>
                            <CreditCard size={22} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

