module.exports = {
  apps: [{
    name: 'lims-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/myproject/lims-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_BACKEND_URL: 'https://api.gripcolims.com'
    },
    error_file: '/var/log/pm2/lims-frontend-error.log',
    out_file: '/var/log/pm2/lims-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
