// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    root: ".", // Project root is the frontend folder
    base: "./", // Relative paths for assets
    envPrefix: "VITE_", // Restrict environment variables to VITE_ prefix
    server: {
        port: 5173, // Default Vite port
        host: true, // Allow access from network (useful for testing)
        proxy: {
            "/api": {
                target: "http://localhost:5000", // Backend URL for development
                changeOrigin: true,
                secure: false, // Disable SSL verification for local backend
                rewrite: (path) => path.replace(/^\/api/, "/api"), // Preserve /api prefix
            },
        },
    },
    build: {
        outDir: "dist", // Output directory
        emptyOutDir: true, // Clear output directory before building
        sourcemap: true, // Generate sourcemaps for debugging
        minify: "esbuild", // Use esbuild for faster minification
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor libraries into separate chunks for better caching
                    vendor: ["react", "react-dom", "react-router-dom", "axios"],
                },
            },
        },
    },
});