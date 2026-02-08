import config from './app.js';

export default {
    uri: config.database.mongoUri,
    options: config.database.options,
  };