import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "VITE_");
  const apiBaseUrl = process.env.VITE_API_BASE_URL || fileEnv.VITE_API_BASE_URL;
  if (mode === "production" && !apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is required for production builds");
  }
  if (apiBaseUrl) {
    process.env.VITE_API_BASE_URL = apiBaseUrl;
  }

  return {
    plugins: [react()],
    server: {
      allowedHosts: true,
    },
    esbuild: {
      logOverride: {
        'ignored-directive': 'silent',
      },
    },
    logLevel: 'info',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion'],
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'vendor-utils': ['react-toastify', 'lucide-react'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
        onwarn(warning, warn) {
          if (
            warning.message.includes('Module level directives') ||
            warning.message.includes('"use client"') ||
            warning.message.includes('"was ignored"')
          ) {
            return;
          }

          if (warning.code === 'UNRESOLVED_IMPORT') {
            throw new Error(`Build failed due to unresolved import:\n${warning.message}`);
          }

          if (warning.code === 'PLUGIN_WARNING' && /is not exported/.test(warning.message)) {
            throw new Error(`Build failed due to missing export:\n${warning.message}`);
          }

          warn(warning);
        },
      },
      chunkSizeWarningLimit: 500,
    },
  };
});
