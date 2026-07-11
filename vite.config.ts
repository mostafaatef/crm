import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import devServer from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';

export default defineConfig({
  plugins: [
    devServer({
      entry: 'server/index.ts',
      adapter,
      exclude: [
        /^\/@.+$/,
        /.*\.(ts|tsx|vue|svelte|css)($|\?)/,
        /.*\.(s?css|less)($|\?)/,
        /^\/favicon\.ico$/,
        /.*\.(svg|png)($|\?)/,
        /^\/(src|node_modules)\/.*/,
      ]
    }),
    react()
  ],
  server: {
    host: true, // Listen on all local IPs
    allowedHosts: true, // Allow dev container hostnames
  }
});
