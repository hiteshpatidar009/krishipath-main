import type { Response } from 'express';

export const ok = <T>(res: Response, data: T, message?: string, status = 200, meta?: unknown) =>
  res.status(status).json({ success: true, data, ...(message ? { message } : {}), ...(meta ? { meta } : {}) });
