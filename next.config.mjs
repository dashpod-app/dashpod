/** @type {import('next').NextConfig} */
const nextConfig = {
    // allow images from any
    images: {
        remotePatterns: [
          {
            hostname: '*',
          },
        ],
      },
};

export default nextConfig;
