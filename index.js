import express, { Router } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const { PORT } = process.env;

const app = express();

const router = Router();

routes(router);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', (_, res) => {
  res.send('Welcome to Banka. The future is now...');
});

app.use('/api/v1', router);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} Not found.` });
});

app.listen(PORT, () => {
  console.log('We make magic on port 2800');
});

export default app;
