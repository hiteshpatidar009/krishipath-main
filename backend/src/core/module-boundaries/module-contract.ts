export interface ModuleContract {
  readonly moduleName: string;
  readonly version: string;
}

export interface ModuleProvider<TContract extends ModuleContract> {
  getContract(): TContract;
}
