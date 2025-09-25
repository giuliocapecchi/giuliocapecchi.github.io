const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = ''; 
if (isGithubActions && process.env.GITHUB_REPOSITORY === 'giuliocapecchi.github.io') {
  repo = ''; 
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
    path: isGithubActions && repo === '' ? '/_next/image' : `${repo}/_next/image`, 
  },
};

module.exports = nextConfig;