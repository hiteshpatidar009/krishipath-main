export class InventoryContractAdapter {
    receiveInventoryUseCase;
    moduleName = "inventory";
    version = "1.0.0";
    constructor(receiveInventoryUseCase) {
        this.receiveInventoryUseCase = receiveInventoryUseCase;
    }
    receive(input) {
        return this.receiveInventoryUseCase.execute(input);
    }
}
