import { Router } from "express";

import { getMessages } from "./message.controller";

const router = Router();

router.get("/", getMessages);

export default router;