import 'dotenv/config';
import { app, initServices, startServer } from './app.js';

const port = Number(process.env.PORT) || 4000;

initServices()
  .then(() => startServer(port))
  .catch(err => {
    console.error('Falha ao iniciar serviços:', err);
    process.exit(1);
  });

export default app;
