import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const normalizeEnvValue = (value?: string) => (value ?? '').trim().replace(/^['"`]/, '').replace(/['"`]$/, '');
    const supabaseUrl = normalizeEnvValue(env.VITE_SUPABASE_URL || env.SUPABASE_URL);
    const supabaseAnonKey = normalizeEnvValue(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY);
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
