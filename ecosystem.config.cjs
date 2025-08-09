module.exports = {
  apps: [
    {
      name: "nikostyle-backend",
      script: "./dist/server.js",
      instances: "max", // Use max for maximum CPU utilization
      exec_mode: "cluster", // Run in cluster mode for load balancing
      autorestart: true, // Auto restart if app crashes
      watch: false, // Don't watch for file changes in production
      max_memory_restart: "1G", // Restart if memory usage exceeds 1GB
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      // Error logs
      error_file: "./logs/pm2/error.log",
      // Output logs
      out_file: "./logs/pm2/info.log",
      // Merge error and info logs
      merge_logs: true,
      // Add timestamp to logs
      time: true,
    },
  ],
};
