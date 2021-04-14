/**
 * 永続性のあるデータの読み書きを行うモジュール.
 */

import config from '../config.js';
import SampleDataSource from './sample-source.js';

/** @type {import('./datasource-base').default} */
let datasource;

switch (config.datasource.type) {
  case 'sample':
    datasource = new SampleDataSource();
    break;
  default:
    throw new Error(`Unsupported datasource.type: ${config.datasource.type}`);
}

/**
 * データソースを初期化する。
 * この関数はWebサーバ開始前に実行して置かなければならない。
 * この関数が正常終了することでデータソースを使うモジュールが正常に動作するようになる。
 */
async function initDataSource() {
  await datasource.initialize();
}

export {
  initDataSource,
  datasource,
};