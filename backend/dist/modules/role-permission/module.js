import { RolePermissionContractAdapter, } from "./contracts";
import { RolePermissionController } from "./controllers/role-permission.controller";
import { RolePermissionRepository } from "./repositories/role-permission.repository";
import { RolePermissionRoutes } from "./routes/role-permission.routes";
import { RolePermissionService } from "./services/role-permission.service";
export class RolePermissionModule {
    repository;
    service;
    controller;
    routes;
    contract;
    constructor() {
        this.repository = new RolePermissionRepository();
        this.service = new RolePermissionService(this.repository);
        this.controller = new RolePermissionController(this.service);
        this.routes = new RolePermissionRoutes(this.controller);
        this.contract = new RolePermissionContractAdapter(this.repository);
    }
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}
