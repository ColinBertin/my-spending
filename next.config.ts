/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/ledger-generator",
        destination: "/ledger",
        permanent: true,
      },
      {
        source: "/ledger-generator/:path*",
        destination: "/ledger/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
