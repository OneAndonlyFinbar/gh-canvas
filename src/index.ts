import { registerFont } from 'canvas';
import { join } from 'path';
import * as express from 'express';
import * as bp from 'body-parser';
import 'dotenv/config';
import Push from './events/push';

registerFont(join(__dirname, 'assets', 'Lato-Black.ttf'), { family: 'Lato-Bold', style: 'bold', weight: 'bold' });
registerFont(join(__dirname, 'assets', 'Lato-Regular.ttf'), { family: 'Lato', style: 'normal', weight: 'normal' });

const app = express();

app.post('/wh', bp.json(), async (req: express.Request, res: express.Response) => {
  const event = req.headers['x-github-event'];

  if (event === 'push') {
    await Push(req, res);
  }

  res
    .status(200)
    .send('OK')
    .end();
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});