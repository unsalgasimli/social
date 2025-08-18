import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
    id: string;
    email: string;
    name?: string;
};

type AuthContextType = {
    user: User | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Page load-da user-i bərpa et
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData: User, token: string) => {
        setUser(userData); // state-i dərhal yenilə
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null); // state-i dərhal sil
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
