/** @type {import('next').NextConfig} */
const nextConfig = {
  // If you have any custom webpack config here, temporarily comment it out
  // to see if the issue resolves.

  async redirects() {
    return [
      // The ledger routes moved from /ledger-generator to /ledger; keep old
      // bookmarks and shared preview links working.
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
