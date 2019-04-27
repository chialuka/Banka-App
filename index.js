import express, { Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const { PORT } = process.env;

const app = express();

const router = Router();

routes(router);

const swaggerDefinition = {
  info: {
    title: 'Banka Swagger API',
    version: '1.0.0',
    description: 'Documentation for the Banka App',
  },
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./docs/*.yaml'],
};

const swaggerData = swaggerJSDoc(options);

app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerData));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', (_, res) => {
  res.send('Welcome to Banka. The future is now...');
});

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerData);
});

app.use('/api/v1', router);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} Not found.` });
});

app.listen(PORT, () => {
  console.log('We make magic on port 2800');
});

export default app;
