// mobile/next.config.ts
import type { NextConfig } from 'next';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:3333'; // backend (docker)

const nextConfig: NextConfig = {
  // 👇 Diz ao Next que a “workspace root” é a pasta do app mobile
  // (ele para de olhar o lockfile da raiz do monorepo)
  outputFileTracingRoot: path.join(__dirname),

  async rewrites() {
    return [
      // tudo que começa com /api/... será encaminhado ao backend em 3333
      { source: '/api/:path*', destination: `${API_URL}/:path*` },
    ];
  },
};

export default nextConfig;
