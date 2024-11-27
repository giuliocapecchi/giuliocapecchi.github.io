const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = ''; 
if (isGithubActions && process.env.GITHUB_REPOSITORY === 'giuliocapecchi.github.io') {
  repo = ''; 
}

module.exports = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    path: isGithubActions && repo === '' ? '/_next/image' : `${repo}/_next/image`, 
  },
};