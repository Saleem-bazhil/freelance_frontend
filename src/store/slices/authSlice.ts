import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: any | null;
    role: 'CLIENT' | 'FREELANCER' | 'ADMIN' | null;
    isLoading: boolean;
}

const initialState: AuthState = {
    token: null,
    isAuthenticated: false,
    user: null,
    role: null,
    isLoading: true, // Initially true while we check async storage
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        restoreToken: (state, action: PayloadAction<{ token: string; user: any; role: string }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.role = action.payload.role as any;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        signIn: (state, action: PayloadAction<{ token: string; user: any; role: string }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.role = action.payload.role as any;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        signOut: (state) => {
            state.token = null;
            state.user = null;
            state.role = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        }
    },
});

export const { restoreToken, signIn, signOut, setLoading } = authSlice.actions;
export default authSlice.reducer;
