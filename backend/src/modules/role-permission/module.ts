import { Router } from "express";

import {
  RolePermissionContract,
  RolePermissionContractAdapter,
} from "./contracts";
import { RolePermissionController } from "./controllers/role-permission.controller";
import { RolePermissionRepository } from "./repositories/role-permission.repository";
import { RolePermissionRoutes } from "./routes/role-permission.routes";
import { RolePermissionService } from "./services/role-permission.service";

export class RolePermissionModule {
  private readonly repository: RolePermissionRepository;
  private readonly service: RolePermissionService;
  private readonly controller: RolePermissionController;
  private readonly routes: RolePermissionRoutes;
  private readonly contract: RolePermissionContract;

  constructor() {
    this.repository = new RolePermissionRepository();
    this.service = new RolePermissionService(this.repository);
    this.controller = new RolePermissionController(this.service);
    this.routes = new RolePermissionRoutes(this.controller);
    this.contract = new RolePermissionContractAdapter(this.repository);
  }

  public getRouter(): Router {
    return this.routes.getRouter();
  }

  public getContract(): RolePermissionContract {
    return this.contract;
  }
}

