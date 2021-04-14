/**
 * ゲーム進行を管理するモジュール
 */

import { v4 as uuidv4 } from 'uuid';

import { BadRequest, SessionData } from '../model/index.js';
import { ServerError } from '../model/index.js';
import { datasource } from '../datasource/index.js';

const F = {
  UNKNOWN: -1,
  MINE: -2,
  OUT_OF_FIELD: -3,
};


/**
 * state 上の 特定の位置 の値を取得する
 * @param {Array<number>} position
 * @param {Array} state;
 */
function getValue(position, state) {
  for (let i = 0; i < position.length; i++) {
    const idx = position[i];
    if (idx < 0 || idx >= state.length) {
      return F.OUT_OF_FIELD;
    }
    state = state[idx];
  }
  return state;
}

/**
 * state 上の 特定の位置に値をセットする.
 * @param {Number} value 
 * @param {Array<Number>} position 
 * @param {Array} state 
 */
function setValue(value, position, state) {
  for (let i = 0; i < position.length - 1; i++) {
    state = state[position[i]];
  }
  state[position[position.length - 1]] = value;
}

/**
 * 指定された位置とその回りの地雷数を調査してセットする。
 * 地雷数が0の位置があれば、再帰的に地雷数を調べてセットする.
 * @param {Array<Array<Number>>} stack 調査待ちの位置
 * @param {Array} state
 */
function searchMines(stack, state) {
  if (stack.length === 0) {
    return;
  }

  const base_pos = stack.pop();
  const target_pos = Array(base_pos.length);
  const targets = [];

  let n_mines = 0; // 周りの地雷数

  // TODO: 2次元が前提の処理になっている。n次元のstateで計算できるよう修正しろ
  for (let d0 = -1; d0 <= 1; d0++) {
    for (let d1 = -1; d1 <= 1; d1++) {
      target_pos[0] = base_pos[0] + d0;
      target_pos[1] = base_pos[1] + d1;
      const target_value = getValue(target_pos, state);
      if (target_value === F.OUT_OF_FIELD) {
        continue;
      }
      if (target_value === F.MINE) {
        n_mines++;
      }
      targets.push([...target_pos]);
    }
  }

  if (n_mines !== 0) {
    setValue(n_mines, base_pos, state);
  } else {
    for (const p of targets) {
      const v = getValue(p, state);
      if (v === F.UNKNOWN) {
        stack.push(v);
      }
    }
    searchMines(stack, state);
  }

}

/**
 * 1つのセッションを表すクラス
 */
class Session {

  /** @type {import('../model').SessionData} */
  #data;

  /**
   * @param {String} id id of this session
   * @param {import('../model').MineField} field
   */
  constructor(id, field) {
    this.id = id;
    /** @type {Array} */
    this.#data = new SessionData(id, field.id, field.field_size);
    this.#data.state = null;
  }

  /**
   * 
   * @param {Array<number>} position 
   * @return {Promise<Boolean>} true if touched a mine.
   */
  async touch(position) {
    const state = this.#data.state;

    const pos_val = getValue(position, state);
    if (pos_val !== F.UNKNOWN) {
      throw new BadRequest(`${position} is already touched or safe`);
    }

    // 計算処理を容易にするため、一時的に地雷の位置を state にセットする。
    const field = await datasource.getMineField(this.#data.field_id);
    for (const mine_pos of field.mines_layout) {
      setValue(F.MINE, mine_pos, state);
    }

    if (getValue(position, state) === F.MINE) {
      // 地雷を踏んだ
      this.status.code = -1;
      this.status.text = 'game over';
      return true;
    }

    const stack = [ position ];
    searchMines(stack, state);

    // 地雷の位置を UNKNOWN に戻す
    for (const mine_pos of field.mines_layout) {
      setValue(F.UNKNOWN, mine_pos, state);
    }
    return false;
  }

  /**
   * @return {Array}
   */
  get state() {
    return this.#data.state;
  }

  /** @param {Array} new_state */
  set state(new_state) {
    this.#data.state = new_state;
  }

  get data() {
    return this.#data;
  }

  get status() {
    return this.#data.status;
  }

}

/**
 * セッション(ゲームプレイ)を管理するクラス
 */
class SessionManager {

  #sessions = new Map();

  constructor() {
  }

  /**
   * @param {import('../model').MineField} field
   * @return {Promise<Session>}
   */
  async createSession(field) {
    if (this.#sessions.size > 100) {
      throw new ServerError('too many sessions');
    }
    const session = new Session(uuidv4(), field);

    this.#sessions.set(session.id, session);
    // TODO: 2次元配列を前提とした処理になっている。n次元配列のfieldを作れるように
    const state = [];
    for (let y = 0; y < field.field_size[1]; y++) {
      const row = [];
      for (let x = 0; x < field.field_size[0]; x++) {
        row.push(-1);
      }
      state.push(row);
    }
    session.state = state;

    session.status.text = 'still alive';
    session.status.code = 1;
    
    return session;
  }

  async removeSession(id) {
    this.#sessions.delete(id);
  }

  /**
   * @param {String} id 
   * @return {Promise<Session>}
   */
  async getSession(id) {
    const session = this.#sessions.get(id);
    if (!session) {
      throw new BadRequest(`session(${id}) not found. `);
    }
    return session;
  }

}

const instance = new SessionManager();

export default instance;