
import { MineField, ServerError, BadRequest } from '../model/index.js';
import DataSourceBase from './datasource-base.js';

const sample_3x3 = [
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 2],
  [2, 0], [2, 1], [2, 2],
];

const sample_8x8 = [
  [ 0, 0 ], [ 0, 5], [ 0, 6],
  [ 1, 1 ], [1, 3], [1, 7],
  [ 2, 3], [ 2, 7],
  [ 3, 3], [ 3, 5],
  [ 4, 2], [ 4, 4 ], [4, 6],
  [ 5, 0], [ 5, 5 ],
  [ 6, 5 ], [ 6, 6 ], [ 6, 7],
  [ 7, 4 ], [7, 6],
];


/**
 * とりあえず動く用のデータソース.
 * MineFieldは一つのみでオンメモリで保持するだけ.
 */
class SampleDataSource extends DataSourceBase {

  /** @type {Array<MineField} */
  #fields;

  /** @type {Map<String, SessionData>}*/
  #sessions = new Map();

  constructor() {
    super();
    this.#fields = [];
    this.#fields.push(new MineField('sample_8x8', 'sample_8x8', [8, 8], sample_8x8));
    this.#fields.push(new MineField('sample_3x3', 'sample_3x3', [3, 3], sample_3x3));
  }

  async initialize() {
    // nothing to do.
  }

  async listMineFields() {
    return this.#fields;
  }

  async getMineField(id) {
    for (const mf of this.#fields) {
      if (mf.id === id) {
        return mf;
      }
    }
    throw new BadRequest(`${id} does not exist.`);
  }
}

export default SampleDataSource;