import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Animated, Easing, TextInput, Alert } from 'react-native';
import api from '../../services/api';
import { Plus, Camera, Trash2, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FreelancerPortfolioScreen() {
    const [loading, setLoading] = useState(true);
    const [portfolio, setPortfolio] = useState<any[]>([]);

    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await api.get('/freelancer/my/portfolio/');
            setPortfolio(res.data);
        } catch (err) {
            console.log('Error fetching portfolio', err);
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

    const handleUpload = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                alert("You've refused to allow this app to access your photos!");
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false, // Disabled due to missing save/crop button on some Android devices
                quality: 0.8,
            });

            if (!pickerResult.canceled && pickerResult.assets[0]) {
                setSelectedAsset(pickerResult.assets[0]);
                setDescription(''); // Reset description
                setUploadModalVisible(true);
            }
        } catch (error) {
            console.log('Image picker error', error);
            alert('Failed to pick media. Please try again.');
        }
    };

    const confirmUpload = async () => {
        if (!selectedAsset) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', {
                uri: selectedAsset.uri,
                name: selectedAsset.uri.split('/').pop() || 'upload.jpg',
                type: 'image/jpeg'
            } as any);
            formData.append('media_type', 'IMAGE');
            formData.append('description', description || 'Portfolio Item');

            await api.post('/freelancer/my/portfolio/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Reset and refresh
            setUploadModalVisible(false);
            setSelectedAsset(null);
            fetchPortfolio();

            Alert.alert("Success", "Portfolio item uploaded successfully!");
        } catch (error: any) {
            console.log('Upload error', error.response?.data || error);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Failed to upload media. Please try again.';
            alert(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await api.delete(`/freelancer/my/portfolio/${id}/`);
            fetchPortfolio();
        } catch (error) {
            console.log('Delete error', error);
            setLoading(false);
            alert('Failed to delete media.');
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
                <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">Portfolio</Text>
                <TouchableOpacity
                    onPress={handleUpload}
                    className="w-12 h-12 bg-indigo-600 rounded-[20px] items-center justify-center shadow-lg shadow-indigo-300 active:scale-95 transition-transform"
                >
                    <Plus color="white" size={26} strokeWidth={2.5} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {portfolio.length === 0 ? (
                        <View className="items-center justify-center py-24 px-4 bg-white rounded-[32px] border border-slate-100 border-dashed mt-4 shadow-sm shadow-slate-100">
                            <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6 border border-indigo-100/50">
                                <ImageIcon size={44} color="#6366f1" strokeWidth={1.5} />
                            </View>
                            <Text className="text-2xl font-extrabold text-slate-900 mb-3">No items yet</Text>
                            <Text className="text-slate-500 text-center text-base font-medium px-4 leading-relaxed">Add high-quality photos or videos to showcase your creative work to potential clients.</Text>
                            <TouchableOpacity
                                onPress={handleUpload}
                                className="mt-8 bg-indigo-600 px-8 py-4 rounded-2xl shadow-lg shadow-indigo-300 active:scale-95 transition-transform"
                            >
                                <Text className="text-white font-bold text-lg tracking-wide">Upload Media</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap justify-between">
                            {portfolio.map((item, index) => (
                                <View key={index} className="w-[48%] mb-5 bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-md shadow-slate-200/50">
                                    <View className="relative">
                                        <Image
                                            source={{ uri: item.file }}
                                            className="w-full h-44 bg-slate-100"
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            onPress={() => handleDelete(item.id)}
                                            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full items-center justify-center shadow-sm"
                                        >
                                            <Trash2 size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                    <View className="p-4 bg-white flex-row items-center justify-between">
                                        <Text className="font-bold text-slate-800 text-base truncate flex-1">{item.description || 'Untitled'}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                    <View className="h-20" />
                </Animated.View>
            </ScrollView>

            {/* Upload Modal */}
            {uploadModalVisible && selectedAsset && (
                <View className="absolute inset-0 bg-black/60 z-50 justify-center items-center px-6">
                    <View className="bg-white w-full rounded-[32px] p-6 shadow-2xl overflow-hidden">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-extrabold text-slate-900">Upload Details</Text>
                            <TouchableOpacity
                                onPress={() => setUploadModalVisible(false)}
                                className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center -mr-2"
                                disabled={uploading}
                            >
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View className="rounded-[20px] overflow-hidden mb-6 border border-slate-100 bg-slate-50 relative">
                            <Image
                                source={{ uri: selectedAsset.uri }}
                                className="w-full h-48"
                                resizeMode="cover"
                            />
                        </View>

                        <Text className="text-base font-bold text-slate-700 mb-2 ml-1">Description (Optional)</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 mb-8"
                            placeholder="Briefly describe this work..."
                            placeholderTextColor="#94a3b8"
                            value={description}
                            onChangeText={setDescription}
                            editable={!uploading}
                        />

                        <TouchableOpacity
                            className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${uploading ? 'bg-indigo-400' : 'bg-indigo-600'} shadow-lg shadow-indigo-300 active:scale-95 transition-transform`}
                            onPress={confirmUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-bold text-lg tracking-wide">Save Portfolio</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}
