import express, { Router } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import routes from './routes';

const app = express();

const router = Router();

routes(router);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(morgan('dev'));

app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} Not found.` });
});

app.listen(2800, () => {
  console.log('We make magic on port 2800');
});

export default app;