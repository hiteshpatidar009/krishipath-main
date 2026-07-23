export class InventoryOrchestrator {
    inventory;
    constructor(inventory) {
        this.inventory = inventory;
    }
    receive(input) {
        return this.inventory.receive(input);
    }
}
