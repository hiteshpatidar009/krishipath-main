import { Router } from "express";

import messageRoutes from "../modules/messages/message.route";

const router = Router();

router.use("/messages", messageRoutes);

export default router;