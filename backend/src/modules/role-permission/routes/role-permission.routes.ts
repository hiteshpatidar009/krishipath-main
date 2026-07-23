import { Router } from "express";

import {
  PermGuard,
  IdempotencyMiddleware,
  SchemaValidationMiddleware,
  SharedAuthMiddleware,
  CompanyGuard,
} from "../../../shared/security";
import { RolePermissionController } from "../controllers/role-permission.controller";
import { AssignRolePermissionsValidator } from "../validators/assign-role-permissions.validator";
import { CreateRoleValidator } from "../validators/create-role.validator";
import { RoleIdParamValidator } from "../validators/role-id-param.validator";
import { UpdateRoleValidator } from "../validators/update-role.validator";

export class RolePermissionRoutes {
  private readonly router: Router;

  constructor(private readonly controller: RolePermissionController) {
    this.router = Router();
    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): void {
    this.router.get("/rbac/status", this.controller.getStatus);

    this.router.get(
      "/permissions",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.read"),
      this.controller.listPermissions,
    );

    this.router.get(
      "/roles",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.read"),
      this.controller.listRoles,
    );

    this.router.get(
      "/roles/:roleId",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.read"),
      SchemaValidationMiddleware.validate(RoleIdParamValidator.schema, "params"),
      this.controller.getRoleDetail,
    );

    this.router.post(
      "/roles",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.create"),
      IdempotencyMiddleware.requireForMutations(),
      SchemaValidationMiddleware.validate(CreateRoleValidator.schema),
      this.controller.createRole,
    );

    this.router.patch(
      "/roles/:roleId",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.update"),
      IdempotencyMiddleware.requireForMutations(),
      SchemaValidationMiddleware.validate(RoleIdParamValidator.schema, "params"),
      SchemaValidationMiddleware.validate(UpdateRoleValidator.schema),
      this.controller.updateRole,
    );

    this.router.delete(
      "/roles/:roleId",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.delete"),
      IdempotencyMiddleware.requireForMutations(),
      SchemaValidationMiddleware.validate(RoleIdParamValidator.schema, "params"),
      this.controller.deleteRole,
    );

    this.router.post(
      "/roles/:roleId/permissions",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.permission.assign"),
      IdempotencyMiddleware.requireForMutations(),
      SchemaValidationMiddleware.validate(RoleIdParamValidator.schema, "params"),
      SchemaValidationMiddleware.validate(AssignRolePermissionsValidator.schema),
      this.controller.replaceRolePermissions,
    );

    this.router.post(
      "/roles/:roleId/clone",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.create"),
      IdempotencyMiddleware.requireForMutations(),
      SchemaValidationMiddleware.validate(RoleIdParamValidator.schema, "params"),
      this.controller.cloneRole,
    );

    this.router.post(
      "/roles/:roleId/retire",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.update"),
      IdempotencyMiddleware.requireForMutations(),
      SchemaValidationMiddleware.validate(RoleIdParamValidator.schema, "params"),
      this.controller.retireRole,
    );

    this.router.post(
      "/roles/:roleId/restore",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.update"),
      IdempotencyMiddleware.requireForMutations(),
      SchemaValidationMiddleware.validate(RoleIdParamValidator.schema, "params"),
      this.controller.restoreRole,
    );

    this.router.get(
      "/permissions/matrix",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.read"),
      this.controller.getPermissionMatrix,
    );

    this.router.put(
      "/permissions/matrix",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.update"),
      IdempotencyMiddleware.requireForMutations(),
      this.controller.savePermissionMatrix,
    );

    this.router.post(
      "/permissions/publish",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.update"),
      IdempotencyMiddleware.requireForMutations(),
      this.controller.publishPermissionMatrix,
    );

    this.router.post(
      "/permissions/compare",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.read"),
      this.controller.compareRoles,
    );

    this.router.get(
      "/permissions/modules",
      SharedAuthMiddleware.use,
      CompanyGuard.requireCompany,
      PermGuard.require("roles.read"),
      this.controller.listPermissionModules,
    );
  }
}
