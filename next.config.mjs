/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const roles = ['student', 'researcher', 'mentor', 'sponsor', 'admin'];
    return {
      afterFiles: [
        ...roles.map((role) => ({
          source: `/${role}/:path*`,
          destination: `/ui/${role}/:path*`,
        })),
        {
          source: '/projects/:path*',
          destination: '/ui/projects/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
