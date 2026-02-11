module.exports = {
  apps: [{
    name: 'optimiseo',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -H 0.0.0.0 -p 3000',
    cwd: '/home/martin/projects/Optimiseo',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    }
  }]
}