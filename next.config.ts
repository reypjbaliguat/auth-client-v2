import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard", // The new default page path
        permanent: true, // Use permanent: false for temporary redirects
      },
    ];
  },
};

export default nextConfig;
