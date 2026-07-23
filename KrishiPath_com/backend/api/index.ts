import type { Request, Response } from 'express';
import { app } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

export default async function handler(req: Request, res: Response) {
  await connectDatabase();
  return app(req, res);
}
