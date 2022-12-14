module.exports = {
  images: {
    remotePatterns: [
      {
        hostname: "**.supabase.co",
      },
    ],
  },
  fs: false,
  path: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.path = false;
    }
    return config;
  },
};
