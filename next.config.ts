/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Old ledger URLs (/ledger-generator, then /ledger) now live under /ledgers
    return ["/ledger-generator", "/ledger"].flatMap((oldBase) => [
      { source: oldBase, destination: "/ledgers", permanent: true },
      {
        source: `${oldBase}/:path*`,
        destination: "/ledgers/:path*",
        permanent: true,
      },
    ]);
  },
};

module.exports = nextConfig;
