module.exports = {
  images: {
    remotePatterns: [
      {
        hostname: "**.supabase.co",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.path = false;
    }
    return config;
  },
};
