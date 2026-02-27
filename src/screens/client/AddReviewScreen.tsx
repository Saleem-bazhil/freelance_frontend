import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Star } from 'lucide-react-native';
import api from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddReviewScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    // booking id and freelancer details passed from the bookings list
    const { bookingId, freelancerName } = route.params;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a rating from 1 to 5 stars.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/review/reviews/', {
                booking: bookingId,
                rating: rating,
                comment: comment
            });
            Alert.alert('Success', 'Your review has been submitted!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.log('Error submitting review', error);
            Alert.alert('Error', 'Could not submit review. You may have already reviewed this booking.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <View
                className="bg-white pb-4 px-6 shadow-sm shadow-slate-200 border-b border-slate-100 flex-row items-center"
                style={{ paddingTop: Math.max(insets.top, 20) + 16 }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-4"
                >
                    <ArrowLeft color="#475569" size={20} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800">Rate Your Experience</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-8">
                <View className="items-center mb-10">
                    <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-4 border-2 border-indigo-200">
                        <Text className="text-3xl font-bold text-indigo-700">{freelancerName[0].toUpperCase()}</Text>
                    </View>
                    <Text className="text-2xl font-extrabold text-slate-900 mb-1">How was {freelancerName}?</Text>
                    <Text className="text-slate-500 text-center px-4">Your feedback helps creatives improve and helps other clients make decisions.</Text>
                </View>

                {/* Star Rating */}
                <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200 border border-slate-100 items-center mb-6">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Tap to Rate</Text>
                    <View className="flex-row space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                className="p-1"
                            >
                                <Star
                                    size={40}
                                    color={star <= rating ? "#f59e0b" : "#e2e8f0"}
                                    fill={star <= rating ? "#f59e0b" : "transparent"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Comment Input */}
                <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200 border border-slate-100 mb-8">
                    <Text className="text-sm font-semibold text-slate-600 mb-3">Leave a Comment (Optional)</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-base min-h-[120px]"
                        multiline
                        numberOfLines={4}
                        placeholder="What went well? What could be improved?"
                        placeholderTextColor="#94a3b8"
                        textAlignVertical="top"
                        value={comment}
                        onChangeText={setComment}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`py-4 rounded-2xl items-center justify-center shadow-md mb-10 ${loading ? 'bg-indigo-400 shadow-indigo-200' : 'bg-indigo-600 shadow-indigo-300'}`}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Submit Review</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
