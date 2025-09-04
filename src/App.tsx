// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer";

// Lazy-loaded components
const MainPage = lazy(() => import("./pages/MainPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfileInfoPage = lazy(() => import("./pages/ProfileInfoPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Search = lazy(() => import("./components/Search"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-[#222831] text-[#EEEEEE]">Yüklənir...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Redirect authenticated users from login/register
function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-[#222831] text-[#EEEEEE]">Yüklənir...</div>;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-[#222831] text-[#EEEEEE]">Yüklənir...</div>}>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route
                        path="/login"
                        element={
                            <RedirectIfAuthenticated>
                                <LoginPage />
                            </RedirectIfAuthenticated>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <RedirectIfAuthenticated>
                                <RegisterPage />
                            </RedirectIfAuthenticated>
                        }
                    />
                    <Route
                        path="/profileInfo"
                        element={
                            <ProtectedRoute>
                                <ProfileInfoPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/search" element={<Search />} />
                    <Route
                        path="/profile/:id"
                        element={
                            <ProtectedRoute>
                                <UserProfile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Suspense>
            <Footer />
        </BrowserRouter>
    );
}