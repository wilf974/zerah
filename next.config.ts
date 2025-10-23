import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Forcer les routes à être dynamiques
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Configuration pour éviter les erreurs de pré-rendu
  poweredByHeader: false,
  // Optimisation pour les builds
  swcMinify: true,
  // Configuration des routes statiques
  staticPageGenerationTimeout: 1000,
};

export default nextConfig;


