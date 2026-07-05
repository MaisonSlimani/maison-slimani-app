import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3001,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['lucide-react', 'clsx', 'tailwind-merge'],
                    supabase: ['@supabase/supabase-js'],
                    forms: ['react-hook-form', 'zod'],
                    editor: [
                        '@tiptap/core', '@tiptap/react', '@tiptap/starter-kit',
                        '@tiptap/extension-code-block-lowlight', '@tiptap/extension-color',
                        '@tiptap/extension-image', '@tiptap/extension-link',
                        '@tiptap/extension-table', '@tiptap/extension-table-cell',
                        '@tiptap/extension-table-header', '@tiptap/extension-table-row',
                        '@tiptap/extension-task-item', '@tiptap/extension-task-list',
                        '@tiptap/extension-text-style', '@tiptap/extension-underline',
                        'lowlight'
                    ],
                    motion: ['framer-motion']
                }
            }
        }
    }
});
