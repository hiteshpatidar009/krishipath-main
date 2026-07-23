import { join } from "path";
import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { WarehouseValidator } from "./presentation/validators/warehouse.validator";
import { WarehouseModule } from "./module";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { PostgresWarehouseRepository } from "./infrastructure/repositories/postgres-warehouse.repository";
describe("warehouse module", () => {
    it("exposes router", () => {
        expect(new WarehouseModule().getRouter()).toBeDefined();
    });
    it("validates create warehouse payload with all new specifications", () => {
        const payload = WarehouseValidator.create.parse({
            warehouseCode: "WH-NORTH-01",
            warehouseName: "Northern Logistics Hub",
            warehouseType: "Cold Storage",
            contactName: "John Doe",
            contactEmail: "john.doe@example.com",
            contactPhone: "+1234567890",
            timezone: "America/New_York",
            isDefault: true,
            description: "Primary cold storage facility for Northeast region.",
            status: "active",
            country: "United States",
            stateProvince: "New York",
            city: "Syracuse",
            postalCode: "13201",
            addressLine1: "100 Logistics Blvd",
            addressLine2: "Suite A",
            latitude: 43.0481,
            longitude: -76.1474,
            totalCapacity: 50000,
            capacityUnit: "Pallets",
            numberZones: 12,
            numberRacks: 80,
            numberLevels: 6,
            temperatureControlled: true,
            minTemperature: -20,
            maxTemperature: 4,
            hazardousMaterialAllowed: false,
            alternateContactName: "Jane Smith",
            alternateContactEmail: "jane.smith@example.com",
            alternateContactPhone: "+1234567891",
            emergencyContactName: "Emergency Ops",
            emergencyContactPhone: "+1234567899",
            operatingHours: [
                { day: "Monday", hours: "08:00 AM - 08:00 PM", open: true },
                { day: "Sunday", hours: "-", open: false },
            ],
            allowCrossDocking: true,
            allowBulkStorage: true,
            allowHazardousStorage: false,
            requiresAdvanceNotice: true,
            advanceNoticeHours: 24,
            defaultReceivingZoneId: "00000000-0000-4000-8000-000000000001",
            defaultShippingZoneId: "00000000-0000-4000-8000-000000000002",
            integrationType: "WMS_API",
        });
        expect(payload.warehouseCode).toBe("WH-NORTH-01");
        expect(payload.warehouseName).toBe("Northern Logistics Hub");
        expect(payload.temperatureControlled).toBe(true);
        expect(payload.minTemperature).toBe(-20);
        expect(payload.operatingHours?.[0].day).toBe("Monday");
        expect(payload.operatingHours?.[1].open).toBe(false);
    });
    it("validates update warehouse payload", () => {
        const payload = WarehouseValidator.update.parse({
            warehouseName: "Northern Logistics Hub v2",
            status: "maintenance",
            totalCapacity: 60000,
            latitude: 43.05,
            operatingHours: [
                { day: "Saturday", hours: "10:00 AM - 04:00 PM", open: true },
            ],
        });
        expect(payload.warehouseName).toBe("Northern Logistics Hub v2");
        expect(payload.status).toBe("maintenance");
        expect(payload.totalCapacity).toBe(60000);
        expect(payload.latitude).toBe(43.05);
        expect(payload.operatingHours?.[0].day).toBe("Saturday");
    });
    it("validates warehouse zone payload", () => {
        const payload = WarehouseValidator.zone.parse({
            zoneCode: "ZN-COLD-01",
            zoneName: "Cold Storage Zone A",
            zoneType: "Cold Room",
            temperatureType: "Frozen",
            allowsPick: true,
            allowsPutaway: true,
            allowsShipping: false,
            allowsReceiving: true,
            sequenceOrder: 1,
        });
        expect(payload.zoneCode).toBe("ZN-COLD-01");
        expect(payload.allowsShipping).toBe(false);
        expect(payload.sequenceOrder).toBe(1);
    });
    it("validates create bin payload with all specifications", () => {
        const payload = WarehouseValidator.binCreate.parse({
            warehouseZoneId: "00000000-0000-4000-8000-000000000001",
            shelfId: "00000000-0000-4000-8000-000000000002",
            binCode: "BIN-PICK-A-01",
            binType: "Picking",
            maxQuantity: 100,
            maxWeight: 500,
            maxVolume: 2000,
            isPickable: true,
            rack: "A",
            level: "01",
            position: "01",
            generatedBinCode: "A-01-01",
            binName: "Picking Bin A-01-01",
            sizePreset: "Large",
            length: 100,
            width: 80,
            height: 60,
            weightCapacity: 500,
            unitCapacity: 100,
            storageType: "Single SKU",
            maxSkus: 1,
            allowOversize: false,
            allowHeavy: false,
            allowFragile: false,
            allowHazardous: false,
            requiresLiftingEquipment: false,
            pickingPriority: "High",
            pickingSequence: 5,
            fastMover: true,
            replenishmentSource: "Reserve Zone",
            replenishmentThreshold: 20,
            maxPickingQuantity: 50,
            constraintTempSensitive: false,
            constraintHumiditySensitive: false,
            constraintHighValueSecurity: false,
            constraintFefo: false,
            constraintFifo: true,
            constraintLifo: false,
            constraintCycleCountRequired: true,
            constraintQualityCheckRequired: false,
            pickingMethod: "FIFO",
        });
        expect(payload.binCode).toBe("BIN-PICK-A-01");
        expect(payload.maxQuantity).toBe(100);
        expect(payload.fastMover).toBe(true);
        expect(payload.pickingMethod).toBe("FIFO");
    });
    it("validates warehouse zone payload with all new specifications", () => {
        const payload = WarehouseValidator.zone.parse({
            zoneCode: "ZN-COLD-02",
            zoneName: "Cold Storage Zone B",
            description: "Perishable and high-sensitivity pharmaceutical cooling zone.",
            status: "active",
            primaryPurpose: "Storage",
            allowCrossDocking: true,
            allowBulkStorage: false,
            allowHazardousStorage: false,
            allowReturnsProcessing: true,
            allowQualityCheck: true,
            totalCapacity: 5000,
            capacityUnit: "Pallets",
            numberRacks: 24,
            numberLevels: 5,
            numberAisles: 6,
            width: 35.5,
            length: 70,
            height: 8.5,
            temperatureControlled: true,
            temperatureRange: "2 - 8°C",
            humidityControlled: true,
            humidityRange: "45 - 60%",
            lightingType: "LED",
            ventilationRequired: true,
            restrictedAccess: true,
            requiredAccessLevel: "Supervisor",
            securityCameraCoverage: true,
            visitorAllowed: false,
            biometricRequired: true,
            requiresPpe: true,
            accessNotes: "Safety boots and high-visibility vest required.",
            constraintTempSensitive: true,
            constraintHumiditySensitive: true,
            constraintHazardousMaterials: false,
            constraintHighValueArea: true,
            constraintSecurityRestricted: true,
            constraintHeavyLoadOnly: false,
            constraintFragileItemsOnly: false,
            constraintFefoExpiry: true,
        });
        expect(payload.zoneCode).toBe("ZN-COLD-02");
        expect(payload.temperatureControlled).toBe(true);
        expect(payload.temperatureRange).toBe("2 - 8°C");
        expect(payload.restrictedAccess).toBe(true);
        expect(payload.constraintTempSensitive).toBe(true);
        expect(payload.constraintFefoExpiry).toBe(true);
    });
    describe("PostgresWarehouseRepository", () => {
        const repository = new PostgresWarehouseRepository();
        const companyId = "00000000-0000-4000-8000-000000000009";
        it("can create, find, list, dashboard, and delete warehouse and zone", async () => {
            const suffix = Math.random().toString(36).substring(2, 7);
            const whCode = `WH-T-${suffix}`;
            const zCode = `ZN-T-${suffix}`;
            // 1. Create a warehouse
            const { warehouseId } = await repository.create({
                companyId,
                warehouseCode: whCode,
                warehouseName: "Test Hub for Zones",
                warehouseType: "Distribution",
                timezone: "America/New_York",
                totalCapacity: 10000,
                capacityUnit: "Pallets",
                numberZones: 5,
                numberRacks: 10,
                numberLevels: 4,
            });
            expect(warehouseId).toBeDefined();
            // 2. Create a zone
            const { zoneId } = await repository.createZone({
                companyId,
                warehouseId,
                zoneCode: zCode,
                zoneName: "Test Zone Cold",
                zoneType: "Cold Room",
                temperatureType: "Chilled",
                allowsPick: true,
                allowsPutaway: true,
                allowsShipping: true,
                allowsReceiving: true,
                sequenceOrder: 1,
                description: "Integration test zone",
                status: "active",
                primaryPurpose: "Storage",
                totalCapacity: 1000,
                capacityUnit: "Pallets",
                numberRacks: 5,
                numberLevels: 4,
                numberAisles: 2,
                width: 10,
                length: 20,
                height: 5,
                temperatureControlled: true,
                temperatureRange: "2 - 8°C",
                humidityControlled: true,
                humidityRange: "40 - 50%",
                lightingType: "LED",
                ventilationRequired: true,
                restrictedAccess: true,
                requiredAccessLevel: "Level 2",
                securityCameraCoverage: true,
                visitorAllowed: false,
                biometricRequired: true,
                requiresPpe: true,
                accessNotes: "Use helmet",
                constraintTempSensitive: true,
                constraintHumiditySensitive: true,
                constraintFefoExpiry: true,
            });
            expect(zoneId).toBeDefined();
            // 3. Find/Get detailed zone info
            const zoneDetails = await repository.findZone(companyId, warehouseId, zoneId);
            expect(zoneDetails).not.toBeNull();
            expect(zoneDetails?.zoneName).toBe("Test Zone Cold");
            expect(zoneDetails?.environmentalControls?.temperatureControlled).toBe(true);
            expect(zoneDetails?.environmentalControls?.temperatureRange).toBe("2 - 8°C");
            expect(zoneDetails?.accessSecurity?.restrictedAccess).toBe(true);
            expect(zoneDetails?.accessSecurity?.biometricRequired).toBe(true);
            expect(zoneDetails?.activeConstraints?.constraintTempSensitive).toBe(true);
            // 4. List zones
            const zoneListResult = await repository.listZones(companyId, warehouseId, {
                search: "Test Zone",
            });
            expect(zoneListResult.items.length).toBeGreaterThan(0);
            const foundZone = zoneListResult.items.find((z) => z.id === zoneId);
            expect(foundZone).toBeDefined();
            expect(foundZone.constraints).toContain("temperature_sensitive");
            // 5. Get zone dashboard statistics
            const zoneDashboard = await repository.getZoneDashboard(companyId, warehouseId);
            expect(zoneDashboard.summary.totalZones).toBeGreaterThan(0);
            expect(zoneDashboard.constraintsOverview.temperatureControlled).toBeGreaterThan(0);
            // 6. List staff
            const staffList = await repository.listZoneStaff(companyId, zoneId);
            expect(Array.isArray(staffList)).toBe(true);
            // Bin integration tests
            const binSuffix = Math.random().toString(36).substring(2, 7);
            const binCode = `BIN-T-${binSuffix}`;
            // Create Bin
            const { binId } = await repository.createBin({
                companyId,
                warehouseId,
                warehouseZoneId: zoneId,
                binCode,
                binType: "Picking",
                maxQuantity: 50,
                maxWeight: 200,
                maxVolume: 1000,
                isPickable: true,
                isActive: true,
                rack: "Rack A",
                level: "Level 1",
                position: "01",
                binName: "Test Picking Bin",
                description: "Integration test bin",
                sizePreset: "Medium",
                length: 50,
                width: 40,
                height: 30,
                weightCapacity: 200,
                unitCapacity: 50,
                storageType: "Standard",
                maxSkus: 3,
                allowOversize: false,
                allowHeavy: false,
                allowFragile: true,
                allowHazardous: false,
                requiresLiftingEquipment: false,
                pickingPriority: "High",
                pickingSequence: 10,
                fastMover: true,
                replenishmentSource: "Reserve Bin",
                replenishmentThreshold: 10,
                maxPickingQuantity: 20,
                constraintTempSensitive: false,
                constraintHumiditySensitive: false,
                constraintHighValueSecurity: false,
                constraintFefo: false,
                constraintFifo: true,
                constraintLifo: false,
                constraintCycleCountRequired: false,
                constraintQualityCheckRequired: false,
                pickingMethod: "FIFO"
            });
            expect(binId).toBeDefined();
            // Find Bin
            const bin = await repository.findBin(companyId, warehouseId, binId);
            expect(bin).not.toBeNull();
            expect(bin?.binCode).toBe(binCode);
            expect(bin?.isPickable).toBe(true);
            expect(bin?.fastMover).toBe(true);
            // Find Bin Details
            const binDetails = await repository.findBinDetails(companyId, warehouseId, binId);
            expect(binDetails).not.toBeNull();
            expect(binDetails?.binName).toBe("Test Picking Bin");
            expect(binDetails?.utilizationRate).toBe(0);
            // List Bins
            const binListResult = await repository.listBins(companyId, warehouseId, {
                zoneId,
                binType: "Picking",
                status: "Active",
                search: "Test Picking"
            });
            expect(binListResult.items.length).toBeGreaterThan(0);
            // Get Bin Dashboard
            const binDashboard = await repository.getBinDashboard(companyId, warehouseId);
            expect(binDashboard.summary.totalBins).toBeGreaterThan(0);
            // Adjacent Bins
            const adjacent = await repository.getAdjacentBins(companyId, warehouseId, binId);
            expect(Array.isArray(adjacent)).toBe(true);
            // Lock/Unlock/Maintenance
            await repository.lockBin(companyId, warehouseId, binId);
            let updatedBin = await repository.findBin(companyId, warehouseId, binId);
            expect(updatedBin?.status).toBe("Locked");
            await repository.unlockBin(companyId, warehouseId, binId);
            updatedBin = await repository.findBin(companyId, warehouseId, binId);
            expect(updatedBin?.status).toBe("Active");
            await repository.setBinMaintenance(companyId, warehouseId, binId, true);
            updatedBin = await repository.findBin(companyId, warehouseId, binId);
            expect(updatedBin?.status).toBe("Maintenance");
            // Delete Bin
            await repository.deleteBin(companyId, warehouseId, binId);
            const binAfterDelete = await repository.findBin(companyId, warehouseId, binId);
            expect(binAfterDelete).toBeNull();
            // Putaway Rules Integration Tests
            // 1. Create Rule
            const { ruleId: newRuleId } = await repository.createPutawayRule(companyId, warehouseId, {
                ruleName: "Test Expiry Rule",
                ruleCode: "PR-TEST-EXP",
                ruleType: "Expiry Based",
                status: "Active",
                targetZoneId: zoneId,
                priority: 5,
                hasExpiry: true
            });
            expect(newRuleId).toBeDefined();
            // 2. Get Dashboard
            const putawayDashboard = await repository.getPutawayRulesDashboard(companyId, warehouseId);
            expect(putawayDashboard.summary.totalRules).toBeGreaterThan(0);
            expect(putawayDashboard.summary.activeRules).toBeGreaterThan(0);
            // 3. List Rules
            const rulesList = await repository.listPutawayRules(companyId, warehouseId);
            expect(rulesList.total).toBeGreaterThan(0);
            const firstRule = rulesList.items[0];
            expect(firstRule).toBeDefined();
            // 4. Evaluate Putaway Recommendation
            const recommendation = await repository.evaluatePutawaySuggestion(companyId, warehouseId, {
                sku: "WH-1000-EXP",
                hasExpiry: true
            });
            expect(recommendation.recommendedZoneId).toBe(zoneId);
            expect(recommendation.matchedRules.length).toBeGreaterThan(0);
            // 5. Rule details
            const ruleDetails = await repository.getPutawayRuleDetails(companyId, warehouseId, newRuleId);
            expect(ruleDetails).not.toBeNull();
            expect(ruleDetails?.rule.ruleCode).toBe("PR-TEST-EXP");
            // 6. Rule history/activity
            const history = await repository.getPutawayRuleHistory(companyId, warehouseId, newRuleId);
            expect(Array.isArray(history)).toBe(true);
            // 7. Duplicate rule
            const { ruleId: duplicatedRuleId } = await repository.duplicatePutawayRule(companyId, warehouseId, newRuleId);
            expect(duplicatedRuleId).toBeDefined();
            const duplicatedRule = await repository.getPutawayRule(companyId, warehouseId, duplicatedRuleId);
            expect(duplicatedRule?.ruleName).toContain("(Copy)");
            // 8. Delete Putaway Rule
            await repository.deletePutawayRule(companyId, warehouseId, newRuleId);
            await repository.deletePutawayRule(companyId, warehouseId, duplicatedRuleId);
            const deletedRule = await repository.getPutawayRule(companyId, warehouseId, newRuleId);
            expect(deletedRule).toBeNull();
            // Pick Waves Integration Tests
            // 1. Create Template
            const { templateId } = await repository.createWaveTemplate(companyId, warehouseId, {
                templateName: "Standard Wave Template",
                templateCode: "WT-STD",
                waveType: "batch",
                priority: "high",
                maxOrders: 20,
                maxUnits: 100,
                isActive: true,
            });
            expect(templateId).toBeDefined();
            // 2. Get Template
            const template = await repository.getWaveTemplate(companyId, warehouseId, templateId);
            expect(template).not.toBeNull();
            expect(template?.templateName).toBe("Standard Wave Template");
            // 3. List Templates
            const templatesList = await repository.listWaveTemplates(companyId, warehouseId);
            expect(templatesList.total).toBeGreaterThan(0);
            // 4. Create Wave from Template
            const { waveId: waveIdFromTemplate } = await repository.applyWaveTemplate(companyId, warehouseId, templateId, "Morning Picking Wave", "W-MORNING-01");
            expect(waveIdFromTemplate).toBeDefined();
            // 5. Get Wave
            const wave = await repository.getPickWave(companyId, warehouseId, waveIdFromTemplate);
            expect(wave).not.toBeNull();
            expect(wave?.waveName).toBe("Morning Picking Wave");
            expect(wave?.waveType).toBe("batch");
            // 6. Get Wave Details
            const waveDetails = await repository.getPickWaveDetails(companyId, warehouseId, waveIdFromTemplate);
            expect(waveDetails).not.toBeNull();
            expect(waveDetails.waveName).toBe("Morning Picking Wave");
            // 7. Get Dashboard
            const pickWaveDashboard = await repository.getPickWaveDashboard(companyId, warehouseId);
            expect(pickWaveDashboard.totalWaves).toBeGreaterThan(0);
            // 8. List Waves
            const wavesList = await repository.listPickWaves(companyId, warehouseId);
            expect(wavesList.total).toBeGreaterThan(0);
            // 9. Assign pickers
            await repository.assignWavePickers(companyId, warehouseId, waveIdFromTemplate, [randomUUID()]);
            // 10. Recalculate Wave
            const recResult = await repository.recalculateWave(companyId, warehouseId, waveIdFromTemplate);
            expect(recResult.routeOptimizationCoverage).toBeDefined();
            // 11. List Available Orders
            const orderPool = await repository.listAvailableOrderPool(companyId, warehouseId);
            expect(Array.isArray(orderPool.items)).toBe(true);
            // 12. Release Wave
            await repository.releasePickWave(companyId, warehouseId, waveIdFromTemplate);
            const waveReleased = await repository.getPickWave(companyId, warehouseId, waveIdFromTemplate);
            expect(waveReleased?.status).toBe("released");
            // 13. Cancel Wave
            await repository.cancelPickWave(companyId, warehouseId, waveIdFromTemplate);
            const waveCancelled = await repository.getPickWave(companyId, warehouseId, waveIdFromTemplate);
            expect(waveCancelled?.status).toBe("cancelled");
            // 14. Duplicate Wave
            const { waveId: duplicatedWaveId } = await repository.duplicatePickWave(companyId, warehouseId, waveIdFromTemplate);
            expect(duplicatedWaveId).toBeDefined();
            // Pick Lists Integration Tests
            // 1. Create Pick List
            const uniqueCode = `PL-TEST-${randomUUID().substring(0, 8)}`;
            const { pickListId } = await repository.createPickList(companyId, warehouseId, {
                waveId: waveIdFromTemplate,
                pickListName: "Test Pick List",
                pickListCode: uniqueCode,
                orderType: "Standard",
                priority: "High",
                description: "Integration testing pick list",
                pickMethod: "Discrete",
                allocationStrategy: "FIFO",
                optimizeRoute: true,
                groupByLocation: true,
                allowShortPicks: false,
                requiresApproval: false,
                notifyOnCompletion: true,
                dueDate: new Date(),
                estPickTime: 30,
                estRouteDistance: 120,
            });
            expect(pickListId).toBeDefined();
            // 2. Get Pick List
            const pickList = await repository.getPickList(companyId, warehouseId, pickListId);
            expect(pickList).not.toBeNull();
            expect(pickList?.pickListName).toBe("Test Pick List");
            expect(pickList?.status).toBe("pending");
            // 3. Get Pick List Details
            const pickListDetails = await repository.getPickListDetails(companyId, warehouseId, pickListId);
            expect(pickListDetails).not.toBeNull();
            expect(pickListDetails.id).toBe(pickListId);
            // 4. Update Pick List
            await repository.updatePickList(companyId, warehouseId, pickListId, {
                pickListName: "Updated Test Pick List",
                description: "Updated description for integration testing",
            });
            const pickListUpdated = await repository.getPickList(companyId, warehouseId, pickListId);
            expect(pickListUpdated?.pickListName).toBe("Updated Test Pick List");
            expect(pickListUpdated?.description).toBe("Updated description for integration testing");
            // 5. List Pick Lists
            const listsResult = await repository.listPickLists(companyId, warehouseId);
            expect(listsResult.total).toBeGreaterThan(0);
            // 6. Get Pick List Dashboard
            const plDashboard = await repository.getPickListDashboard(companyId, warehouseId);
            expect(plDashboard.overview.totalLists).toBeGreaterThan(0);
            // 7. Assign Picker
            const dummyPickerId = randomUUID();
            await repository.assignPicker(companyId, warehouseId, pickListId, dummyPickerId);
            const pickListAssigned = await repository.getPickList(companyId, warehouseId, pickListId);
            expect(pickListAssigned?.assignedPickerId).toBe(dummyPickerId);
            expect(pickListAssigned?.status).toBe("assigned");
            // 8. Change Priority
            await repository.changePriority(companyId, warehouseId, pickListId, "Urgent");
            const pickListPriority = await repository.getPickList(companyId, warehouseId, pickListId);
            expect(pickListPriority?.priority).toBe("Urgent");
            // 9. Update Status
            await repository.updateStatus(companyId, warehouseId, pickListId, "picking");
            const pickListStatus = await repository.getPickList(companyId, warehouseId, pickListId);
            expect(pickListStatus?.status).toBe("picking");
            // 10. Record Scan
            const scanResult = await repository.recordScan(companyId, warehouseId, pickListId, {
                scannedCode: "BARCODE123",
                expectedCode: "BARCODE123",
            });
            expect(scanResult.matched).toBe(true);
            // 11. Record Short Pick
            const shortPickResult = await repository.recordShortPick(companyId, warehouseId, pickListId, {
                itemId: randomUUID(),
                productId: randomUUID(),
                sku: "SKU-SHORT-01",
                binId: randomUUID(),
                binCode: "BIN-A-01",
                orderedQuantity: 10,
                pickedQuantity: 4,
                shortQuantity: 6,
                reason: "Damaged inventory",
            });
            expect(shortPickResult.recorded).toBe(true);
            // 12. Confirm Pick Item
            const dummyItemId = randomUUID();
            const confirmResult = await repository.confirmPickItem(companyId, warehouseId, pickListId, dummyItemId, 5);
            expect(confirmResult.confirmed).toBe(true);
            // 13. Skip Location
            await repository.skipLocation(companyId, warehouseId, pickListId, randomUUID());
            // 14. Report Issue
            await repository.reportIssue(companyId, warehouseId, pickListId, "Blocked aisle");
            // 15. Add Note
            await repository.addNote(companyId, warehouseId, pickListId, "Check high shelf carefully");
            // 16. List Picker Performance
            const performance = await repository.listPickerPerformance(companyId);
            expect(Array.isArray(performance)).toBe(true);
            // 17. List Picker Workloads
            const workloads = await repository.listPickerWorkloads(companyId);
            expect(Array.isArray(workloads)).toBe(true);
            // 18. Delete Pick List
            await repository.deletePickList(companyId, warehouseId, pickListId);
            const pickListDeleted = await repository.getPickList(companyId, warehouseId, pickListId).catch(() => null);
            expect(pickListDeleted).toBeNull();
            // 15. Delete Waves and Templates
            await repository.deletePickWave(companyId, warehouseId, waveIdFromTemplate);
            await repository.deletePickWave(companyId, warehouseId, duplicatedWaveId);
            await repository.deleteWaveTemplate(companyId, warehouseId, templateId);
            // 7. Clean up
            await repository.deleteZone(companyId, warehouseId, zoneId);
            const zoneAfterDelete = await repository.findZone(companyId, warehouseId, zoneId);
            expect(zoneAfterDelete).toBeNull();
            await repository.delete(companyId, warehouseId);
        }, 60000);
    });
});
registerEnterpriseModuleTests({
    moduleName: "warehouse",
    moduleDir: join(process.cwd(), "src", "modules", "warehouse"),
    ModuleClass: WarehouseModule,
    expectedRouteCount: 105,
    requiresAuth: true,
});
