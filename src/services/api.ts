import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development, you might need your local IP instead of localhost for Android simulator
// e.g., 'http://192.168.1.xxx:8000'
// Use your machine's IP address if testing on a physical device over Wi-Fi.
// If testing on an Android Emulator, change this to: 'http://10.0.2.2:8000'
// const API_URL = 'http://127.0.0.1:8000';
const API_URL = 'https://freelance-backend-pwh5.onrender.com';


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
