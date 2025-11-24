// backend/app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectToCloudinary from './config/cloudinay.js';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import contactRouter from './routes/contactRouter.js';
import abandonedRoutes from './routes/abandonedRoutes.js';
import chatRouter from './routes/chatRouter.js';
import commentRouter from "./routes/commentRouter.js";
import notificationRouter from "./routes/notificationRouter.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectToCloudinary();

// ---- CORS (somente domínios permitidos) ----
const RAW_ALLOWED_ORIGINS = [
  'https://www.usemarima.com',
  'http://localhost:3333',
  'http://localhost:5173',
];
const ALLOWED_ORIGINS = new Set(
  RAW_ALLOWED_ORIGINS.map(o => String(o).replace(/\/$/, ''))
);

const corsOptions = {
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

app.use(express.json());
app.use(cors(corsOptions));
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

app.get('/', (req, res) => {
  res.send('Olá');
});

// Listener
app.listen(port, () => {
  console.log(`Servidor Iniciado no Link = http://localhost:${port}`);
});
