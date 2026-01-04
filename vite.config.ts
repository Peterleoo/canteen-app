import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, (globalThis as any).process.cwd(), '');
  
  return {
    plugins: [react()],
    base: env.VITE_BASE_URL || '/',
    build: {
      outDir: 'dist',
    },
    server: {
      port: 3002,
      host: '0.0.0.0',
      ipv6: true
    }
  };
});