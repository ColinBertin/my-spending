/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/ledger-generator",
        destination: "/ledgers",
        permanent: true,
      },
      {
        source: "/ledger-generator/:path*",
        destination: "/ledgers/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
