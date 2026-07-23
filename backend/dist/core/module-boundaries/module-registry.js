export class ModuleRegistry {
    contracts = new Map();
    register(contract) {
        if (this.contracts.has(contract.moduleName)) {
            throw new Error(`Module already registered: ${contract.moduleName}`);
        }
        this.contracts.set(contract.moduleName, contract);
    }
    get(moduleName) {
        const contract = this.contracts.get(moduleName);
        if (!contract) {
            throw new Error(`Module contract not found: ${moduleName}`);
        }
        return contract;
    }
    has(moduleName) {
        return this.contracts.has(moduleName);
    }
}
