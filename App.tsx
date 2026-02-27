import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';

import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreToken } from './src/store/slices/authSlice';

const AppContent = () => {
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userStr = await AsyncStorage.getItem('user');
        const role = await AsyncStorage.getItem('userRole');

        if (token && userStr && role) {
          store.dispatch(restoreToken({ token, user: JSON.parse(userStr), role }));
        } else {
          store.dispatch(restoreToken({ token: '', user: null, role: '' })); // Will set isAuthenticated false but stop loading
        }
      } catch (e) {
        store.dispatch(restoreToken({ token: '', user: null, role: '' }));
      }
    };
    loadAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
