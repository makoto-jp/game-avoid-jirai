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


  /**
   * @param {import('../model').SessionData} session 
   * @return {Promise<SessionData>}
   */
  async addSession(session) {
    throw new Error('needs implementation');
  }

  /**
   * @param {import('../model').SessionData} session 
   * @return {Promise<SessionData>}
   */
  async updateSession(session) {
    throw new Error('needs implementation');
  }

  /**
   * @return {Promise<import('../model').SessionData>}
   */
  async getSession(session_id) {
    throw new Error('needs implementation');
  }
}

export default DataSourceBase;