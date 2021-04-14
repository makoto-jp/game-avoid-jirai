import fastify from 'fastify';
import { v4 as uuidv4 } from 'uuid';

import session_manager from './services/session-manager.js';
import { MineField, BadRequest, schemas, ServerError, SessionData } from './model/index.js';

const app = fastify();
import { datasource } from './datasource/index.js';

/**
 * 遊べる地雷原のリストを返す
 */
app.get('/minefields',
  { ...schemas.with({ response: [MineField] })},
  async(req, res) => {
    return await datasource.listMineFields();
  }
);

/**
 * 特定の地雷原の情報を返す
 */
app.get('/minefields/:id', {
    ...schemas.with({ response: MineField })
  }, 
  async(req, res) => {
    const mf = datasource.getMineField(req.params['id']);
    return mf;
  }
);

/**
 * 新しくゲームを始める
 */
app.post('/sessions',
  async(req, res) => {
    const field_id = req.body?.field_id;
    const field = await datasource.getMineField(field_id);

    const session = await session_manager.createSession(field);
    console.log(session.data.status);
    return session.data;
  }
);

app.put('/sessions/:session_id/touch',
  async(req, res) => {
    /** @type {Array<number>} */
    const position = req.body.position;
    if (!(position instanceof Array)) { // TODO validate each items
      throw new BadRequest('position must be Array<number>');
    }
    const session = await session_manager.getSession(req.params.session_id);
    if (await session.touch(position)) {
      await session_manager.removeSession(session.id);
    }

    console.log(session.data.status);
    return session.data;
  }
);

app.setErrorHandler(async(err, req, res) => {
  console.error(err);
  if (err instanceof BadRequest) {
    res.status(400);
    return err;
  } else if (err instanceof ServerError) {
    res.status(500);
    return err;
  }

  return new ServerError(err.toString());
});

export default app;