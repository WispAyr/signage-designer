module.exports = {
  apps: [
    {
      name: 'signage-designer',
      script: 'npm',
      args: 'run dev',
      cwd: '/Users/noc/operations/signage-designer',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3450
      }
    },
    {
      name: 'signage-mcp',
      script: 'src/mcp/server.js',
      cwd: '/Users/noc/operations/signage-designer',
      interpreter: 'node',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
