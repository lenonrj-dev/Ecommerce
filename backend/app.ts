import express, { type Request, type Response } from 'express';
import cors, { type CorsOptions } from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongodb.js';
import connectToCloudinary from './config/cloudinay.js';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import contactRouter from './routes/contactRouter.js';
import abandonedRoutes from './routes/abandonedRoutes.js';
import chatRouter from './routes/chatRouter.js';
import commentRouter from "./routes/commentRouter.js";
import notificationRouter from "./routes/notificationRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- CORS (somente domínios permitidos) ----
const RAW_ALLOWED_ORIGINS = [
  'https://www.usemarima.com',
  'http://localhost:3333',
  'http://localhost:5173',
];
const ALLOWED_ORIGINS = new Set(
  RAW_ALLOWED_ORIGINS.map(o => String(o).replace(/\/$/, ''))
);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // normaliza (remove barra final)
    const normalized = (origin || '').replace(/\/$/, '');
    // permite ferramentas server-to-server (origin ausente) sem abrir para outros domínios
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.has(normalized)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'token', // seu frontend envia "token" no header
  ],
  optionsSuccessStatus: 204,
};

export const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { fallthrough: false }));
// opcional, mas recomendado para pré-flight explícito em alguns proxies
app.options('*', cors(corsOptions));

// API Endpoints
app.use("/api/notification", notificationRouter);
app.use("/api/comment", commentRouter);
app.use('/api/abandoned', abandonedRoutes);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/contact', contactRouter);
app.use('/api/chat', chatRouter);

app.get('/', (_req: Request, res: Response) => {
  res.send('Olá');
});

export const initServices = async () => {
  await connectDB();
  await connectToCloudinary();
};

export const startServer = (desiredPort: number) => {
  const server = app.listen(desiredPort, () => {
    console.log(`Servidor Iniciado no Link = http://localhost:${desiredPort}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `A porta ${desiredPort} ja esta em uso. Finalize o processo que esta usando esta porta ou defina outra porta na variavel PORT do seu .env.`
      );
    } else {
      console.error('Erro ao iniciar o servidor:', err);
    }
    process.exit(1);
  });

  return server;
};
