import { Router } from "express";
import { UserService } from "./application/user.service";
import { UserRepository } from "./infrastructure/user.repository";
import { UserController } from "./presentation/user.controller";
import { UserRoutes } from "./presentation/user.routes";

export class UserModule {
  private readonly repo = new UserRepository();
  private readonly service = new UserService(this.repo);
  private readonly controller = new UserController(this.service);
  private readonly routes = new UserRoutes(this.controller);

  public getRouter(): Router {
    return this.routes.getRouter();
  }
}
