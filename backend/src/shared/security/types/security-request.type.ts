import { Request } from "express";
import { SecurityContextDto } from "../dtos/security-context.dto";

export type SecurityRequest = Request & {
  requestId?: string;
  securityContext?: SecurityContextDto;
};
