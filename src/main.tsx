// src/main.tsx
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <AuthProvider>
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-[#222831] text-[#EEEEEE]">Yüklənir...</div>}>
                <App />
            </Suspense>
        </AuthProvider>
    </React.StrictMode>
);