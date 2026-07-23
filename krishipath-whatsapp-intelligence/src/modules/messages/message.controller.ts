import { Request, Response } from "express";

import messageService from "./message.service";

export async function getMessages(
  req: Request,
  res: Response
) {
  const messages = await messageService.getLatest();

  return res.json(messages);
}