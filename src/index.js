/**
 * 地雷サーバを起動するモジュール
 */

import app from './app.js';
import { initDataSource as initDataSource } from './datasource/index.js';

import config from './config.js';

(async() => {
  try {
    await initDataSource();

    const address = await app.listen(config.server.port, config.server.address);
    console.log(`jirai-server listening on ${address}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
