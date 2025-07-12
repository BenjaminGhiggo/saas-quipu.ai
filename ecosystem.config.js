module.exports = {
  apps: [
    {
      name: 'quipu-backend',
      script: 'server-simple.js',
      cwd: '/proyectos1/saas-quipu.ai/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 7000,
        PWD: '/proyectos1/saas-quipu.ai/backend'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 3000,
      error_file: '/proyectos1/saas-quipu.ai/logs/backend-error.log',
      out_file: '/proyectos1/saas-quipu.ai/logs/backend-out.log',
      log_file: '/proyectos1/saas-quipu.ai/logs/backend-combined.log',
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
      exec_mode: 'fork',
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