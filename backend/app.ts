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
const extraEnvOrigins = (process.env.BACKEND_ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const RAW_ALLOWED_ORIGINS = [
  'https://www.usemarima.com',
  'https://usemarima.com',
  'http://localhost:3333',
  'http://localhost:5173',
  process.env.FRONTEND_URL || '',
  process.env.ADMIN_URL || '',
  ...extraEnvOrigins,
].filter(Boolean);

const normalizeOrigin = (o: string) => String(o || '').replace(/\/$/, '');
const ALLOWED_ORIGINS = new Set(RAW_ALLOWED_ORIGINS.map(normalizeOrigin));

const isAllowedOrigin = (origin = '') => {
  const normalized = normalizeOrigin(origin);
  if (ALLOWED_ORIGINS.has(normalized)) return true;
  // permite *.vercel.app
  if (/\.vercel\.app$/i.test(new URL(origin).hostname)) return true;
  return false;
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // permite ferramentas server-to-server (origin ausente) sem abrir para outros domínios
    if (!origin) return callback(null, true);
    try {
      if (isAllowedOrigin(origin)) return callback(null, true);
    } catch { /* ignore parse error */ }
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

const dashboardHtml = `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Marima API - Status</title>
    <style>
      body { font-family: Arial, sans-serif; background:#0f172a; color:#e2e8f0; margin:0; padding:32px; }
      .card { max-width: 720px; margin:0 auto; background:#111827; border:1px solid #1f2937; border-radius:16px; padding:24px; box-shadow:0 10px 40px rgba(0,0,0,0.25); }
      h1 { margin:0 0 8px 0; font-size:24px; }
      p { margin:6px 0; color:#cbd5e1; }
      .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px; margin-top:16px; }
      .pill { padding:10px 12px; border-radius:12px; background:#0b111f; border:1px solid #1f2937; }
      a { color:#38bdf8; text-decoration:none; }
      a:hover { text-decoration:underline; }
      code { background:#0b111f; padding:2px 6px; border-radius:6px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Marima API</h1>
      <p>Status: <strong>online</strong></p>
      <div class="grid">
        <div class="pill">
          <strong>Health</strong><br/>
          <a href="/api/status">/api/status</a>
        </div>
        <div class="pill">
          <strong>Produtos</strong><br/>
          <a href="/api/product/list">/api/product/list</a>
        </div>
        <div class="pill">
          <strong>Comentários (sample)</strong><br/>
          <a href="/api/comment/fallback-macacao?limit=1">/api/comment/fallback-macacao?limit=1</a>
        </div>
      </div>
      <p style="margin-top:18px;font-size:13px;">Env: <code>${process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'}</code></p>
    </div>
  </body>
</html>
`;

app.get('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(dashboardHtml);
});

app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    time: new Date().toISOString(),
  });
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
