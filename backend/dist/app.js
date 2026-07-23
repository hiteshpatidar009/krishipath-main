import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { AuthModule } from "./modules/auth/module";
import { ActivityLogModule } from "./modules/activity-log/module";
import { AuditLogModule } from "./modules/audit-log/module";
// import { ApiKeyModule } from "./modules/api-key/module";
// import { BillingModule } from "./modules/billing/module";
// import { CustomerModule } from "./modules/customer/module";
// import { DashboardModule } from "./modules/dashboard/module";
// import { DocumentModule } from "./modules/document/module";
import { EmailModule } from "./modules/email/module";
// import { EnterpriseModule } from "./modules/enterprise/module";
import { FileStorageModule } from "./modules/file-storage/module";
// import { FinanceAccountingModule } from "./modules/finance-accounting/module";
import { NotificationModule } from "./modules/notification/module";
// import { OrganizationModule } from "./modules/organization/module";
// import { PlatformLogModule } from "./modules/platform-log/module";
// import { ProductModule } from "./modules/product/module";
// import { InventoryModule } from "./modules/inventory/module";
import { PushNotificationModule } from "./modules/push-notification/module";
// import { PurchaseProcurementModule } from "./modules/purchase-procurement/module";
// import { QualityManagementModule } from "./modules/quality-management/module";
// import { ReorderStockPlanningModule } from "./modules/reorder-stock-planning/module";
import { RolePermissionModule } from "./modules/role-permission/module";
import { SettingsModule } from "./modules/settings/module";
// import { SetupWizardModule } from "./modules/setup-wizard/module";
import { SmsModule } from "./modules/sms/module";
// import { StockAdjustmentModule } from "./modules/stock-adjustment/module";
// import { StockCountingReconciliationModule } from "./modules/stock-counting-reconciliation/module";
// import { StockReservationModule } from "./modules/stock-reservation/module";
// import { StockTransferModule } from "./modules/stock-transfer/module";
// import { SupplierModule } from "./modules/supplier/module";
// import { TaxModule } from "./modules/tax/module";
import { UserModule } from "./modules/user/module";
// import { WarehouseModule } from "./modules/warehouse/module";
import { MandiModule } from "./modules/mandi/module";
import { FarmerModule } from "./modules/farmer/module";
import { TraderModule } from "./modules/trader/module";
import { MarketInsightModule } from "./modules/market-insight/module";
import { ContentModule } from "./modules/content/module";
import { KrishiGuruModule } from "./modules/krishiguru/module";
import { RewardModule } from "./modules/reward/module";
import { LocalizationModule } from "./modules/localization/module";
import { WeatherModule } from "./modules/weather/module";
import { MarketSourceModule } from "./modules/market-source/module";
import { AdminManagementRoutes } from "./modules/user/presentation/admin-management.routes";
import { SecurityModule } from "./shared/security";
import { ErrorLoggerMiddleware, RequestIdMiddleware, RequestLoggerMiddleware, ResponseLoggerMiddleware, logger, } from "./infrastructure/logger";
import { ErrorResponsePresenter } from "./shared/http/error-response.presenter";
import { env } from "./infrastructure/config/env";
export class App {
    expressApp;
    authModule;
    activityLogModule;
    auditLogModule;
    // private readonly apiKeyModule: ApiKeyModule;
    // private readonly billingModule: BillingModule;
    // private readonly customerModule: CustomerModule;
    // private readonly dashboardModule: DashboardModule;
    // private readonly documentModule: DocumentModule;
    emailModule;
    // private readonly enterpriseModule: EnterpriseModule;
    fileStorageModule;
    // private readonly financeAccountingModule: FinanceAccountingModule;
    notificationModule;
    // private readonly organizationModule: OrganizationModule;
    // private readonly platformLogModule: PlatformLogModule;
    // private readonly productModule: ProductModule;
    // private readonly inventoryModule: InventoryModule;
    pushNotificationModule;
    // private readonly purchaseProcurementModule: PurchaseProcurementModule;
    // private readonly qualityManagementModule: QualityManagementModule;
    // private readonly reorderStockPlanningModule: ReorderStockPlanningModule;
    rolePermissionModule;
    settingsModule;
    // private readonly setupWizardModule: SetupWizardModule;
    smsModule;
    // private readonly stockAdjustmentModule: StockAdjustmentModule;
    // private readonly stockCountingReconciliationModule: StockCountingReconciliationModule;
    // private readonly stockReservationModule: StockReservationModule;
    // private readonly stockTransferModule: StockTransferModule;
    // private readonly supplierModule: SupplierModule;
    // private readonly taxModule: TaxModule;
    userModule;
    // private readonly warehouseModule: WarehouseModule;
    securityModule;
    mandiModule;
    farmerModule;
    traderModule;
    marketInsightModule;
    contentModule;
    krishiGuruModule;
    rewardModule;
    localizationModule;
    weatherModule;
    marketSourceModule;
    constructor() {
        this.expressApp = express();
        this.authModule = new AuthModule();
        this.activityLogModule = new ActivityLogModule();
        this.auditLogModule = new AuditLogModule();
        // this.apiKeyModule = new ApiKeyModule();
        // this.billingModule = new BillingModule();
        // this.customerModule = new CustomerModule();
        // this.dashboardModule = new DashboardModule();
        // this.documentModule = new DocumentModule();
        this.emailModule = new EmailModule();
        // this.enterpriseModule = new EnterpriseModule();
        this.fileStorageModule = new FileStorageModule();
        // this.financeAccountingModule = new FinanceAccountingModule();
        this.notificationModule = new NotificationModule();
        // this.organizationModule = new OrganizationModule();
        // this.platformLogModule = new PlatformLogModule();
        // this.productModule = new ProductModule();
        // this.inventoryModule = new InventoryModule();
        this.pushNotificationModule = new PushNotificationModule();
        // this.purchaseProcurementModule = new PurchaseProcurementModule();
        // this.qualityManagementModule = new QualityManagementModule();
        // this.reorderStockPlanningModule = new ReorderStockPlanningModule();
        this.rolePermissionModule = new RolePermissionModule();
        this.settingsModule = new SettingsModule();
        // this.setupWizardModule = new SetupWizardModule();
        this.smsModule = new SmsModule();
        // this.stockAdjustmentModule = new StockAdjustmentModule();
        // this.stockCountingReconciliationModule = new StockCountingReconciliationModule();
        // this.stockReservationModule = new StockReservationModule();
        // this.stockTransferModule = new StockTransferModule();
        // this.supplierModule = new SupplierModule();
        // this.taxModule = new TaxModule();
        this.userModule = new UserModule();
        // this.warehouseModule = new WarehouseModule();
        this.securityModule = new SecurityModule();
        this.localizationModule = new LocalizationModule();
        this.mandiModule = new MandiModule(this.localizationModule.translationService);
        this.farmerModule = new FarmerModule();
        this.traderModule = new TraderModule();
        this.marketInsightModule = new MarketInsightModule();
        this.contentModule = new ContentModule();
        this.krishiGuruModule = new KrishiGuruModule();
        this.rewardModule = new RewardModule();
        this.weatherModule = new WeatherModule();
        this.marketSourceModule = new MarketSourceModule();
    }
    async initialize() {
        await logger.info("App initialization started", {
            module: "app",
            tags: ["app", "init", "start"],
        });
        this.initializeMiddlewares();
        this.initializeHealthCheck();
        this.initializeModules();
        this.initializeNotFoundHandler();
        this.initializeErrorHandler();
        await logger.info("App initialization completed", {
            module: "app",
            tags: ["app", "init", "done"],
        });
    }
    getExpressApp() {
        return this.expressApp;
    }
    initializeMiddlewares() {
        const corsOptions = {
            origin: (origin, callback) => {
                if (!origin || this.isCorsOriginAllowed(origin)) {
                    callback(null, true);
                    return;
                }
                callback(new Error("CORS origin denied"));
            },
            credentials: env.corsCredentials,
            methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: [
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "X-Company-Id",
                "X-Warehouse-Id",
                "X-Request-Id",
                "X-Correlation-Id",
                "X-Trace-Id",
                "X-Tenant-Id",
                "Idempotency-Key",
                "Accept",
            ],
            optionsSuccessStatus: 204,
        };
        this.expressApp.use(helmet());
        this.expressApp.use(cors(corsOptions));
        this.expressApp.use(compression());
        this.expressApp.use(cookieParser());
        this.expressApp.use("/api/v1/billing/webhooks/stripe", express.raw({ type: "application/json", limit: env.requestBodyLimit }));
        this.expressApp.use(express.json({ limit: env.requestBodyLimit }));
        this.expressApp.use(express.urlencoded({ extended: true }));
        this.expressApp.use(RequestIdMiddleware.use);
        this.expressApp.use(this.securityModule.getGlobalMiddlewares());
        this.expressApp.use(ResponseLoggerMiddleware.use);
        this.expressApp.use(RequestLoggerMiddleware.use);
        this.expressApp.use(morgan("dev"));
        // Language resolution — sets req.lang on every request
        this.expressApp.use(this.localizationModule.getLanguageMiddleware());
        void logger.info("Core middlewares initialized", {
            module: "app",
            tags: ["app", "middleware", "init"],
        });
    }
    isCorsOriginAllowed(origin) {
        if (env.corsOrigins.includes(origin)) {
            return true;
        }
        const localOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;
        if (localOrigin.test(origin)) {
            return true;
        }
        const vercelAppOrigin = /^https:\/\/krishipath(?:-[a-z0-9-]+)?\.vercel\.app$/i;
        return vercelAppOrigin.test(origin);
    }
    initializeHealthCheck() {
        this.expressApp.get("/health", (_request, response) => {
            response.status(200).json({
                success: true,
                message: "Server is healthy",
                timestamp: new Date().toISOString(),
            });
        });
    }
    initializeModules() {
        const routeMounts = [
            { module: "auth", path: "/api/v1/auth", router: this.authModule.getRouter() },
            { module: "iam", path: "/api/v1/iam", router: this.rolePermissionModule.getRouter() },
            { module: "iam", path: "/api/v1/iam/users", router: this.userModule.getRouter() },
            // { module: "iam", path: "/api/v1/iam/api-keys", router: this.apiKeyModule.getRouter() },
            { module: "activity-log", path: "/api/v1/activity-log", router: this.activityLogModule.getRouter() },
            { module: "activity-log", path: "/api/v1/activity-logs", router: this.activityLogModule.getRouter() },
            // { module: "api-key", path: "/api/v1/api-keys", router: this.apiKeyModule.getRouter() },
            // { module: "billing", path: "/api/v1/billing", router: this.billingModule.getRouter() },
            // { module: "platform-log", path: "/api/v1/platform-log", router: this.platformLogModule.getRouter() },
            // { module: "platform-log", path: "/api/v1/platform-logs", router: this.platformLogModule.getRouter() },
            // { module: "customer", path: "/customer", router: this.customerModule.getRouter() },
            // { module: "customer", path: "/api/v1/customer", router: this.customerModule.getRouter() },
            // { module: "customer", path: "/api/v1/customers", router: this.customerModule.getRouter() },
            // { module: "customer", path: "/api/v1/customer/group", router: this.customerModule.getCustomerGroupsRouter() },
            // { module: "customer", path: "/api/v1/customer-groups", router: this.customerModule.getCustomerGroupsRouter() },
            // { module: "dashboard", path: "/api/v1/dashboard", router: this.dashboardModule.getRouter() },
            { module: "audit-log", path: "/api/v1/audit-log", router: this.auditLogModule.getRouter() },
            { module: "audit-log", path: "/api/v1/audit-logs", router: this.auditLogModule.getRouter() },
            // { module: "document", path: "/api/v1/document", router: this.documentModule.getRouter() },
            // { module: "document", path: "/api/v1/documents", router: this.documentModule.getRouter() },
            { module: "email", path: "/api/v1/email", router: this.emailModule.getRouter() },
            // { module: "enterprise", path: "/api/v1/enterprises", router: this.enterpriseModule.getRouter() },
            { module: "file-storage", path: "/api/v1/file-storage", router: this.fileStorageModule.getRouter() },
            // { module: "finance-accounting", path: "/api/v1/finance", router: this.financeAccountingModule.getRouter() },
            { module: "notification", path: "/api/v1/notification", router: this.notificationModule.getRouter() },
            { module: "notification", path: "/api/v1/notifications", router: this.notificationModule.getRouter() },
            // { module: "organization", path: "/api/v1/organization", router: this.organizationModule.getRouter() },
            // { module: "organization", path: "/api/v1/organizations", router: this.organizationModule.getRouter() },
            // { module: "product", path: "/api/v1/product", router: this.productModule.getRouter() },
            // { module: "product", path: "/api/v1/products", router: this.productModule.getRouter() },
            // { module: "inventory", path: "/api/v1/inventory", router: this.inventoryModule.getRouter() },
            // { module: "stock-reservation", path: "/api/v1/stock-reservation", router: this.stockReservationModule.getRouter() },
            // { module: "stock-reservation", path: "/api/v1/stock-reservations", router: this.stockReservationModule.getRouter() },
            // { module: "stock-adjustment", path: "/api/v1/stock-adjustment", router: this.stockAdjustmentModule.getRouter() },
            // { module: "stock-adjustment", path: "/api/v1/stock-adjustments", router: this.stockAdjustmentModule.getRouter() },
            // { module: "stock-counting-reconciliation", path: "/api/v1/stock-counting-reconciliation", router: this.stockCountingReconciliationModule.getRouter() },
            // { module: "stock-counting-reconciliation", path: "/api/v1/inventory/aging-dead-stock", router: this.stockCountingReconciliationModule.getRouter() },
            // { module: "stock-counting-reconciliation", path: "/api/v1/aging-dead-stock", router: this.stockCountingReconciliationModule.getRouter() },
            // { module: "stock-counting-reconciliation", path: "/api/v1/inventory/count-reconciliation", router: this.stockCountingReconciliationModule.getRouter() },
            // { module: "stock-counting-reconciliation", path: "/api/v1/count-reconciliation", router: this.stockCountingReconciliationModule.getRouter() },
            // { module: "stock-transfer", path: "/api/v1/stock-transfer", router: this.stockTransferModule.getRouter() },
            // { module: "stock-transfer", path: "/api/v1/stock-transfers", router: this.stockTransferModule.getRouter() },
            { module: "push-notification", path: "/api/v1/push-notification", router: this.pushNotificationModule.getRouter() },
            { module: "push-notification", path: "/api/v1/push-notifications", router: this.pushNotificationModule.getRouter() },
            // { module: "purchase-procurement", path: "/api/v1/purchase-procurement", router: this.purchaseProcurementModule.getRouter() },
            // { module: "quality-management", path: "/api/v1/quality", router: this.qualityManagementModule.getRouter() },
            // { module: "quality-management", path: "/api/v1/quality-management", router: this.qualityManagementModule.getRouter() },
            // { module: "reorder-stock-planning", path: "/api/v1/reorder-stock-planning", router: this.reorderStockPlanningModule.getRouter() },
            // { module: "reorder-stock-planning", path: "/api/v1/reorder-policies", router: this.reorderStockPlanningModule.getRouter() },
            { module: "role-permission", path: "/api/v1", router: this.rolePermissionModule.getRouter() },
            { module: "settings", path: "/api/v1/settings", router: this.settingsModule.getRouter() },
            // { module: "setup-wizard", path: "/api/v1/setup-wizard", router: this.setupWizardModule.getRouter() },
            { module: "sms", path: "/api/v1/sms", router: this.smsModule.getRouter() },
            // { module: "subscription", path: "/api/v1/subscription", router: this.subscriptionModule.getRouter() },
            // { module: "subscription", path: "/api/v1/subscriptions", router: this.subscriptionModule.getRouter() },
            // { module: "supplier", path: "/api/v1/supplier", router: this.supplierModule.getRouter() },
            // { module: "supplier", path: "/api/v1/suppliers", router: this.supplierModule.getRouter() },
            // { module: "tax", path: "/api/v1/tax", router: this.taxModule.getRouter() },
            { module: "user", path: "/api/v1/users", router: this.userModule.getRouter() },
            // { module: "warehouse", path: "/api/v1/warehouse", router: this.warehouseModule.getRouter() },
            // { module: "warehouse", path: "/api/v1/warehouses", router: this.warehouseModule.getRouter() },
            // { module: "warehouse", path: "/api/v1/packing-workbenches", router: this.warehouseModule.getPackingWorkbenchRouter() },
            { module: "admin-management", path: "/api/v1/admin", router: new AdminManagementRoutes().getRouter() },
            { module: "mandi-admin", path: "/api/v1/mandi/admin", router: this.mandiModule.getAdminRouter() },
            { module: "mandi", path: "/api/v1/mandi", router: this.mandiModule.getRouter() },
            { module: "farmer", path: "/api/v1/farmer", router: this.farmerModule.getRouter() },
            { module: "trader", path: "/api/v1/traders", router: this.traderModule.getRouter() },
            { module: "market-insight", path: "/api/v1/market-insights", router: this.marketInsightModule.getRouter() },
            { module: "content", path: "/api/v1", router: this.contentModule.getRouter() },
            { module: "content-admin", path: "/api/v1/content/admin", router: this.contentModule.getAdminRouter() },
            { module: "weather", path: "/api/v1/weather", router: this.weatherModule.getRouter() },
            { module: "krishiguru", path: "/api/v1/krishiguru", router: this.krishiGuruModule.getRouter() },
            { module: "reward", path: "/api/v1/rewards", router: this.rewardModule.getRouter() },
            { module: "localization", path: "/api/v1/localization", router: this.localizationModule.getRouter() },
            { module: "market-source", path: "/api/v1/market-sources", router: this.marketSourceModule.getRouter() },
        ];
        for (const mount of routeMounts) {
            this.expressApp.use(mount.path, mount.router);
        }
        void logger.info("Module routes mounted", {
            module: "app",
            tags: ["app", "routes", "mounted"],
            payload: {
                modules: [...new Set(routeMounts.map((mount) => mount.module))],
                routes: routeMounts.map((mount) => mount.path),
            },
        });
    }
    initializeNotFoundHandler() {
        this.expressApp.use((_request, response) => {
            void logger.warn("Route not found", {
                module: "app",
                tags: ["app", "route", "not-found"],
            });
            response.status(404).json({
                success: false,
                message: "Route not found",
            });
        });
    }
    initializeErrorHandler() {
        this.expressApp.use((error, request, response, next) => {
            ErrorLoggerMiddleware.use(error, request, response, next);
            const formatted = ErrorResponsePresenter.from(error);
            response.status(formatted.statusCode).json(formatted.body);
        });
    }
}
