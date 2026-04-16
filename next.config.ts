/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Verhindert Fehler bei fehlenden Umgebungsvariablen während des Builds
  output: 'standalone', 
};

export default nextConfig;
