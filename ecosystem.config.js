module.exports = {
  apps: [
    {
      name: 'quipu-backend',
      script: './backend/server-simple.js',
      cwd: '/proyectos1/saas-quipu.ai',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'quipu-frontend',
      script: 'serve',
      args: '-s dist -p 5000 -n',
      cwd: '/proyectos1/saas-quipu.ai/frontend',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_file: '../logs/frontend-combined.log',
      time: true
    }
  ]
};