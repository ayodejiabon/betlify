module.exports = {
  apps : [{
    name: "betlify",
    script: "./server.js",
    watch: true,
    instances  : 3,
    exec_mode  : "cluster",
    env: {
      NODE_ENV: "development"
    },
    env_staging: {
      NODE_ENV: "staging"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
}