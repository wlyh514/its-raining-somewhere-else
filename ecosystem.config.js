module.exports = {
  apps: [
    {
      name: 'rain-backend',
      script: 'pnpm',
      args: 'prod',
      automation: false,
      watch: false,
      force: true,
      env: {
        PORT: 8000,
        NODE_ENV: 'production',
      },
    },
  ],
}
