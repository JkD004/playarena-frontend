/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables the output of a single standalone folder for Docker deployment
  output: "standalone",
  
  // Disable TypeScript check for production build in case of environment issues
  // (Optional, but often helpful for Docker builds)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;