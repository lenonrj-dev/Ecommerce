// @ts-nocheck
import { app, initServices } from '../backend/app.js';

let ready: Promise<void> | null = null;

const ensureReady = async () => {
  if (!ready) {
    ready = initServices();
  }
  return ready;
};

export default async function handler(req, res) {
  await ensureReady();
  return app(req as any, res as any);
}
