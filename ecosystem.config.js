module.exports = {
  apps : [{
    name: "betlify",
    script: "./server.js",
    watch: true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
      instances  : 3,
      exec_mode  : "cluster",
    }
  }]
}