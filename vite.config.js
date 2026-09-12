import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleDescribeImageRequest } from './server/api/describeImage.js';

// Plugin middleware xử lý AI Vision phía server
function aiVisionPlugin() {
  return {
    name: 'ai-vision-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/ai/describe-image' && req.method === 'POST') {
          try {
            let bodyStr = '';
            req.on('data', chunk => bodyStr += chunk);
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const result = await handleDescribeImageRequest(body);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(result));
              } catch (parseErr) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ success: false, error: parseErr.message }));
              }
            });
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), aiVisionPlugin()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'canvas-confetti']
        }
      }
    }
  }
});
