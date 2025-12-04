import request from 'supertest';
import { app } from '../app.js';

describe('app basics', () => {
  it('responds on root', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text.toLowerCase()).toContain('ol');
  });
});
