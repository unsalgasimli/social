// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../lib/api.js";

interface AuthUser {
    id: string;
    email: string;
    name: string;
    surname: string;
}

interface AuthProfile {
    user_id: string;
    avatar_url?: string;
    bio?: string;
    country?: string;
    city?: string;
    university?: string;
    faculty?: string;
    school?: string;
    work?: string;
    field?: string;
    interests?: string[];
    hobbies?: string[];
    social_links?: Record<string, string>;
    relationship_status?: string;
    communities?: string[];
    optional_links?: Record<string, string>;
    music_links?: string[];
    film_links?: string[];
    serial_links?: string[];
}

interface AuthContextType {
    user: AuthUser | null;
    profile: AuthProfile | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        name: string;
        surname?: string;
        email: string;
        phone?: string;
        age?: number;
        gender?: string;
        password: string;
    }) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    const response = await api.get("/api/profile");
                    const { success, profile, error } = response.data;
                    if (!success) throw new Error(error);
                    setUser({
                        id: profile.user_id,
                        email: profile.user.email,
                        name: profile.user.name,
                        surname: profile.user.surname,
                    });
                    setProfile(profile);
                    setToken(storedToken);
                } catch (err) {
                    console.error("Token validation failed:", err);
                    localStorage.removeItem("token");
                    setUser(null);
                    setProfile(null);
                    setToken(null);
                }
            }
            setIsLoading(false);
        };

        validateToken();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post("/api/auth/login", { email, password });
        const { success, user, profile, token, error } = response.data;
        if (!success) throw new Error(error || "Login failed");
        setUser(user);
        setProfile(profile);
        setToken(token);
        localStorage.setItem("token", token);
    };

    const register = async (data: {
        name: string;
        surname?: string;
        email: string;
        phone?: string;
        age?: number;
        gender?: string;
        password: string;
    }) => {
        const response = await api.post("/api/auth/register", data);
        const { success, user, profile, token, error } = response.data;
        if (!success) throw new Error(error || "Registration failed");
        setUser(user);
        setProfile(profile);
        setToken(token);
        localStorage.setItem("token", token);
    };

    const logout = () => {
        setUser(null);
        setProfile(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, profile, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}