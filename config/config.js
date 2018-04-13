const env = process.env.NODE_ENV || 'test';
console.log('Running Environment: ' + env);

if ( env === 'production' || env === 'test'){
  var config = require('./config.json');
  var envConfig = config[env];
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}


