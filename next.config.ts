import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "v2.gripcolims.com",
       
      },
      {
        protocol: "https",
        hostname: "api.gripcolims.com",
      },
      {
        protocol: "http",
        hostname: "192.168.1.2",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
     
    ],
  },
};

export default nextConfig;
