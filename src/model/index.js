const schemas = {};

class MineField {
  /**
   * 
   * @param {String} id 
   * @param {String} name 
   * @param {Array<number>} field_size 
   * @param {Array<Array>} mines_layout 
   */
  constructor(id, name, field_size, mines_layout) {
    this.id = id;
    this.name = name;
    this.field_size = field_size;
    this.mines_layout = mines_layout;
    this.num_of_mines = mines_layout.length;
  }

  static responseSchema = {
    type: 'object',
    properties: {
      id: { type: 'string'},
      name: { type: 'string'},
      field_size: { type: 'array' },
      num_of_mines: { type: 'number' },
    }
  };
}

/**
 * @typedef SessionStatus
 * @property {Number} code
 * @property {String} text
 */

/**
 * ゲームのセッションを表す.
 */
class SessionData {

  /** @type {MineField} */
  #mine_field;

  /**
   * @type {SessionStatus}
    */
  #status;

  /**
   * @param {String} session_id id of this session
   * @param {String} field_id id of Mine Field
   * @param {Array<number>} field_size
   */
  constructor(session_id, field_id, field_size) {
    this.session_id = session_id;
    this.field_id = field_id;
    this.field_size = field_size;
    this.created_at = (new Date()).getTime();
    this.state = null; // must be set later.

    /** @type {SessionStatus} */
    this.status = {
      code: 0,
      text: 'created',
    };
  }

  static responseSchema = {
    type: 'object',
    properties: {
      session_id: { type: 'string'},
      field_id: { type: 'string' },
      field_size: { type: 'array', items: { type: 'number'} },
      created_at: { type: 'number' },
      state: { type: 'array' },
      status: {
        type: 'object',
        properties: {
          code: { type: 'number' },
          text: {type : 'string' },
        }
      }
    }
  }
}

/**
 * 不正なリクエストを表すモデル.
 */
class BadRequest {
  constructor(message) {
    this.error = 'BadRequest';
    this.message = message;
  }

  static responseSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
    }
  };
}

class ServerError {
  constructor(message) {
    this.error = 'ServerError';
    this.message = message;
  }

  static responseSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
    }
  }
}


class SchemaBuilder {

  #schema;

  constructor() {
    this.#schema = {};
  }

  withResponse(model) {
    let is_array = false;
    if (model instanceof Array) {
      is_array = true;
      model = model[0];
    }

    this.#schema.response = { 
      '200': is_array ?
        { type: 'array', items: { anyOf: [model.responseSchema] }}
        :
        model.responseSchema
    };
    return this;
  }

  build() {
    if (!this.#schema.response) {
      this.#schema.response = {};
    }
    this.#schema.response['400'] = BadRequest.responseSchema;
    this.#schema.response['500'] = ServerError.responseSchema;
    return {
      schema: this.#schema
    };
  }
}

/**
 * @returns {SchemaBuilder}
 */
schemas.with = (opts) => {
  const builder = new SchemaBuilder(schemas);
  if (opts.response) {
    builder.withResponse(opts.response);
  }
  return builder.build();
};

export {
  MineField,
  SessionData,
  BadRequest,
  ServerError,
  schemas,
};