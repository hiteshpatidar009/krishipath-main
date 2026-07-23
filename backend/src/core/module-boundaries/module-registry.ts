import { ModuleContract } from "./module-contract";

export class ModuleRegistry {
  private readonly contracts = new Map<string, ModuleContract>();

  public register(contract: ModuleContract): void {
    if (this.contracts.has(contract.moduleName)) {
      throw new Error(`Module already registered: ${contract.moduleName}`);
    }

    this.contracts.set(contract.moduleName, contract);
  }

  public get<TContract extends ModuleContract>(moduleName: string): TContract {
    const contract = this.contracts.get(moduleName);
    if (!contract) {
      throw new Error(`Module contract not found: ${moduleName}`);
    }

    return contract as TContract;
  }

  public has(moduleName: string): boolean {
    return this.contracts.has(moduleName);
  }
}
