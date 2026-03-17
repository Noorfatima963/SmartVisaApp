import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getToken, saveAuth, clearAll } from '../services/storage';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { restoreSession(); }, []);

    async function restoreSession() {
        try {
            const savedToken = await getToken();
            const savedUser = await getUser();
            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(savedUser);
            }
        } catch (e) {
            console.log('Session restore error:', e);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Register — matches api.auth.register signature exactly
     * NOTE: SignUp.js calls api.auth.register directly (not through here)
     * This is kept for convenience if needed elsewhere
     */
    async function register(firstName, lastName, email, phoneNumber, password) {
        const response = await api.auth.register(firstName, lastName, email, phoneNumber, password);
        // Registration does NOT return a token — user must verify email first
        return response;
    }

    async function login(email, password) {
        const response = await api.auth.login(email, password);
        // Build user object from token response (backend only returns access + refresh)
        const user = { email };
        await saveAuth(response.access, response.refresh, user);
        setToken(response.access);
        setUser(user);
        return response;
    }

    async function logout() {
        await clearAll();
        setToken(null);
        setUser(null);
    }

    function updateUser(updatedUser) {
        setUser(prev => ({ ...prev, ...updatedUser }));
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, register, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}