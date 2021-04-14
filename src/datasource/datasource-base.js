// TODO: 基底クラスを継承させる設計をやめたい
/**
 * jira-serverのデータを読み書きするクラスの基底クラス.
 * @abstract
 */
class DataSourceBase {


  /**
   * データソースを初期化する.
   */
  async initialize() {
    throw new Error('needs implementation');
  }


  /**
   * 全ての地雷原を取得する
   * @return {Promise<Array<import('../model').MineField>>}
   */
  async listMineFields() {
    throw new Error('needs implementation');
  }

  /**
   * idで指定された地雷原を取得する.
   * @param {String} id 
   * @return {import('../model').MineField}
   */
  async getMineField(id) {
    throw new Error('needs implementation');
  }
}

export default DataSourceBase;