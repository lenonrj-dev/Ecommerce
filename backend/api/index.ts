// @ts-nocheck
import { app, initServices } from '../app.js';

let ready: Promise<void> | null = null;

const ensureReady = async () => {
  if (!ready) {
    ready = initServices();
  }
  return ready;
};

export default async function handler(req, res) {
  await ensureReady();
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const pathParam = req.query?.path;
    const forwardedPath = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '');
    url.searchParams.delete('path');
    const nextPath = forwardedPath || '/';
    req.url = nextPath.replace(/\/{2,}/g, '/');
    const qs = url.searchParams.toString();
    if (qs) req.url += `?${qs}`;
  } catch {
    /* ignore - fallback to default req.url */
  }
  return app(req as any, res as any);
}
