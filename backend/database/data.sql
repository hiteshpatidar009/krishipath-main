-- Active: 1782299472968@@rsb-db-1.c1qo6kwis0dl.ap-south-1.rds.amazonaws.com@5432@postgres
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY,
  name varchar,
  code varchar,
  description text,
  monthly_price numeric,
  annual_price numeric,
  currency_code varchar,
  monthly_duration_months integer,
  annual_duration_months integer,
  max_users integer,
  max_warehouses integer,
  max_companies integer,
  max_organizations integer,
  max_products integer,
  max_suppliers integer,
  max_customers integer,
  max_purchase_orders integer,
  max_sales_orders integer,
  max_api_keys integer,
  max_webhooks integer,
  max_integrations integer,
  max_api_requests_per_month integer,
  max_storage_gb integer,
  supports_api boolean,
  supports_sso boolean,
  supports_custom_roles boolean,
  supports_multi_entity boolean,
  supports_advanced_reporting boolean,
  supports_sandbox boolean,
  enterprise_enabled boolean,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS permission_groups (
  id uuid PRIMARY KEY,
  module_name varchar,
  display_name varchar,
  description text,
  sort_order integer
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY,
  permission_group_id uuid,
  module varchar,
  resource varchar,
  action varchar,
  permission_key varchar,
  description text,
  created_at timestamp
);

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS updated_at timestamp;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS enterprise_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_organizations integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_products integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_suppliers integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_customers integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_purchase_orders integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_sales_orders integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_api_keys integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_webhooks integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_integrations integer;
ALTER TABLE permission_groups ADD COLUMN IF NOT EXISTS sort_order integer;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS permission_group_id uuid;


CREATE TEMP TABLE seed_subscription_plans (
  name text, code text, description text, monthly_price numeric, annual_price numeric,
  currency_code text, monthly_duration_months integer, annual_duration_months integer,
  max_users integer, max_warehouses integer, max_companies integer, max_organizations integer,
  max_products integer, max_suppliers integer, max_customers integer, max_purchase_orders integer,
  max_sales_orders integer, max_api_keys integer, max_webhooks integer, max_integrations integer,
  max_api_requests_per_month integer, max_storage_gb integer, supports_api boolean,
  supports_sso boolean, supports_custom_roles boolean, supports_multi_entity boolean,
  supports_advanced_reporting boolean, supports_sandbox boolean, enterprise_enabled boolean
) ON COMMIT DROP;

INSERT INTO seed_subscription_plans VALUES
  ('Free', 'free', 'Free plan for evaluating RSBC with real setup and limited usage.', '0', '0', 'INR', 1, 12, 10, 1, 1, 1, 100, 10, 50, 10, 50, 0, 0, 0, 1000, 1, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),
  ('Starter', 'starter', 'Starter plan for small operators running one company.', '1999', '19990', 'INR', 1, 12, 25, 2, 1, 3, 5000, 500, 5000, 500, 2000, 1, 0, 2, 10000, 10, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),
  ('Growth', 'growth', 'Growth plan for multi-location teams and controlled expansion.', '4999', '49990', 'INR', 1, 12, 100, 5, 3, 10, 50000, 5000, 50000, 5000, 20000, 10, 20, 10, 500000, 100, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE),
  ('Enterprise', 'enterprise', 'Enterprise plan for high-scale multi-company operations.', '14999', '149990', 'INR', 1, 12, 500, 100, 25, 1000000, 100000000, 100000000, 100000000, 100000000, 100000000, 100000000, 100000000, 100000000, 1000000, 1024, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

UPDATE subscription_plans target
SET name = source.name,
    description = source.description,
    monthly_price = source.monthly_price,
    annual_price = source.annual_price,
    currency_code = source.currency_code,
    monthly_duration_months = source.monthly_duration_months,
    annual_duration_months = source.annual_duration_months,
    max_users = source.max_users,
    max_warehouses = source.max_warehouses,
    max_companies = source.max_companies,
    max_organizations = source.max_organizations,
    max_products = source.max_products,
    max_suppliers = source.max_suppliers,
    max_customers = source.max_customers,
    max_purchase_orders = source.max_purchase_orders,
    max_sales_orders = source.max_sales_orders,
    max_api_keys = source.max_api_keys,
    max_webhooks = source.max_webhooks,
    max_integrations = source.max_integrations,
    max_api_requests_per_month = source.max_api_requests_per_month,
    max_storage_gb = source.max_storage_gb,
    supports_api = source.supports_api,
    supports_sso = source.supports_sso,
    supports_custom_roles = source.supports_custom_roles,
    supports_multi_entity = source.supports_multi_entity,
    supports_advanced_reporting = source.supports_advanced_reporting,
    supports_sandbox = source.supports_sandbox,
    enterprise_enabled = source.enterprise_enabled,
    updated_at = now()
FROM seed_subscription_plans source
WHERE target.code = source.code;

INSERT INTO subscription_plans (
  id, name, code, description, monthly_price, annual_price, currency_code,
  monthly_duration_months, annual_duration_months, max_users, max_warehouses,
  max_companies, max_organizations, max_products, max_suppliers, max_customers,
  max_purchase_orders, max_sales_orders, max_api_keys, max_webhooks, max_integrations,
  max_api_requests_per_month, max_storage_gb, supports_api,
  supports_sso, supports_custom_roles, supports_multi_entity,
  supports_advanced_reporting, supports_sandbox, enterprise_enabled, created_at, updated_at
)
SELECT gen_random_uuid(), source.name, source.code, source.description,
       source.monthly_price, source.annual_price, source.currency_code,
       source.monthly_duration_months, source.annual_duration_months,
       source.max_users, source.max_warehouses, source.max_companies,
       source.max_organizations, source.max_products, source.max_suppliers, source.max_customers,
       source.max_purchase_orders, source.max_sales_orders, source.max_api_keys, source.max_webhooks, source.max_integrations,
       source.max_api_requests_per_month, source.max_storage_gb,
       source.supports_api, source.supports_sso, source.supports_custom_roles,
       source.supports_multi_entity, source.supports_advanced_reporting,
       source.supports_sandbox, source.enterprise_enabled, now(), now()
FROM seed_subscription_plans source
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans target WHERE target.code = source.code
);

CREATE TEMP TABLE seed_permission_groups (module_name text, display_name text, description text, sort_order integer) ON COMMIT DROP;

INSERT INTO seed_permission_groups VALUES
  ('activity', 'Activity', 'Activity permissions', 10),
  ('api', 'Api', 'Api permissions', 20),
  ('audit', 'Audit', 'Audit permissions', 30),
  ('auth', 'Auth', 'Auth permissions', 40),
  ('billing', 'Billing', 'Billing permissions', 50),
  ('delivery', 'Delivery', 'Delivery permissions', 60),
  ('docs', 'Docs', 'Docs permissions', 70),
  ('enterprise', 'Enterprise', 'Enterprise permissions', 80),
  ('file', 'File', 'File permissions', 90),
  ('finance', 'Finance', 'Finance permissions', 100),
  ('help', 'Help', 'Help permissions', 110),
  ('integration', 'Integration', 'Integration permissions', 120),
  ('inventory', 'Inventory', 'Inventory permissions', 130),
  ('mobile', 'Mobile', 'Mobile permissions', 140),
  ('notify', 'Notify', 'Notify permissions', 150),
  ('procurement', 'Procurement', 'Procurement permissions', 160),
  ('quality', 'Quality', 'Quality permissions', 170),
  ('reports', 'Reports', 'Reports permissions', 180),
  ('returns', 'Returns', 'Returns permissions', 190),
  ('roles', 'Roles', 'Roles permissions', 200),
  ('sales', 'Sales', 'Sales permissions', 210),
  ('settings', 'Settings', 'Settings permissions', 220),
  ('shipment', 'Shipment', 'Shipment permissions', 230),
  ('support', 'Support', 'Support permissions', 240),
  ('tax', 'Tax', 'Tax permissions', 245),
  ('tenant', 'Tenant', 'Tenant permissions', 250),
  ('users', 'Users', 'Users permissions', 260),
  ('warehouse', 'Warehouse', 'Warehouse permissions', 270),
  ('workflow', 'Workflow', 'Workflow permissions', 280);

UPDATE permission_groups target
SET display_name = source.display_name,
    description = source.description,
    sort_order = source.sort_order
FROM seed_permission_groups source
WHERE target.module_name = source.module_name;

INSERT INTO permission_groups (id, module_name, display_name, description, sort_order)
SELECT gen_random_uuid(), source.module_name, source.display_name, source.description, source.sort_order
FROM seed_permission_groups source
WHERE NOT EXISTS (
  SELECT 1 FROM permission_groups target WHERE target.module_name = source.module_name
);

CREATE TEMP TABLE seed_permissions (module_name text, resource text, action text, permission_key text, description text) ON COMMIT DROP;

INSERT INTO seed_permissions VALUES
  ('auth', 'session', 'read', 'auth.session.read', 'auth.session.read'),
  ('auth', 'session', 'revoke', 'auth.session.revoke', 'auth.session.revoke'),
  ('enterprise', 'enterprise', 'create', 'enterprise.create', 'enterprise.create'),
  ('enterprise', 'enterprise', 'view', 'enterprise.view', 'enterprise.view'),
  ('enterprise', 'enterprise', 'read', 'enterprise.read', 'enterprise.read'),
  ('enterprise', 'enterprise', 'update', 'enterprise.update', 'enterprise.update'),
  ('enterprise', 'enterprise', 'delete', 'enterprise.delete', 'enterprise.delete'),
  ('enterprise', 'configuration', 'manage', 'enterprise.configure', 'enterprise.configure'),
  ('enterprise', 'user', 'assign', 'enterprise.assign_users', 'enterprise.assign_users'),
  ('enterprise', 'document', 'manage', 'enterprise.manage_documents', 'enterprise.manage_documents'),
  ('enterprise', 'audit', 'read', 'enterprise.view_audit_logs', 'enterprise.view_audit_logs'),
  ('enterprise', 'hierarchy', 'manage', 'enterprise.manage_hierarchy', 'enterprise.manage_hierarchy'),
  ('enterprise', 'company', 'add', 'enterprise.company.add', 'enterprise.company.add'),
  ('enterprise', 'company', 'remove', 'enterprise.company.remove', 'enterprise.company.remove'),
  ('enterprise', 'user', 'add', 'enterprise.user.add', 'enterprise.user.add'),
  ('enterprise', 'user', 'remove', 'enterprise.user.remove', 'enterprise.user.remove'),
  ('enterprise', 'transfer', 'create', 'enterprise.transfer.create', 'enterprise.transfer.create'),
  ('enterprise', 'transfer', 'read', 'enterprise.transfer.read', 'enterprise.transfer.read'),
  ('enterprise', 'transfer', 'update', 'enterprise.transfer.update', 'enterprise.transfer.update'),
  ('enterprise', 'transfer', 'approve', 'enterprise.transfer.approve', 'enterprise.transfer.approve'),
  ('enterprise', 'transfer', 'reject', 'enterprise.transfer.reject', 'enterprise.transfer.reject'),
  ('enterprise', 'transfer', 'dispatch', 'enterprise.transfer.dispatch', 'enterprise.transfer.dispatch'),
  ('enterprise', 'transfer', 'receive', 'enterprise.transfer.receive', 'enterprise.transfer.receive'),
  ('enterprise', 'transfer', 'settle', 'enterprise.transfer.settle', 'enterprise.transfer.settle'),
  ('enterprise', 'transfer', 'cancel', 'enterprise.transfer.cancel', 'enterprise.transfer.cancel'),
  ('enterprise', 'billing', 'create', 'enterprise.billing.create', 'enterprise.billing.create'),
  ('enterprise', 'billing', 'read', 'enterprise.billing.read', 'enterprise.billing.read'),
  ('enterprise', 'billing', 'reconcile', 'enterprise.billing.reconcile', 'enterprise.billing.reconcile'),
  ('enterprise', 'reporting', 'read', 'enterprise.reporting.read', 'enterprise.reporting.read'),
  ('tenant', 'tenant', 'read', 'tenant.read', 'tenant.read'),
  ('tenant', 'tenant', 'update', 'tenant.update', 'tenant.update'),
  ('tenant', 'membership', 'read', 'tenant.membership.read', 'tenant.membership.read'),
  ('tenant', 'membership', 'manage', 'tenant.membership.manage', 'tenant.membership.manage'),
  ('tenant', 'organization', 'create', 'organization.create', 'organization.create'),
  ('tenant', 'organization', 'read', 'organization.read', 'organization.read'),
  ('tenant', 'organization', 'update', 'organization.update', 'organization.update'),
  ('tenant', 'organization', 'delete', 'organization.delete', 'organization.delete'),
  ('settings', 'settings', 'read', 'settings.read', 'settings.read'),
  ('settings', 'settings', 'update', 'settings.update', 'settings.update'),
  ('tenant', 'warehouse', 'create', 'warehouse.create', 'warehouse.create'),
  ('users', 'user', 'create', 'users.create', 'users.create'),
  ('users', 'user', 'read', 'users.read', 'users.read'),
  ('users', 'user', 'update', 'users.update', 'users.update'),
  ('users', 'user', 'delete', 'users.delete', 'users.delete'),
  ('users', 'invite', 'create', 'users.invite', 'users.invite'),
  ('roles', 'role', 'create', 'roles.create', 'roles.create'),
  ('roles', 'role', 'read', 'roles.read', 'roles.read'),
  ('roles', 'role', 'update', 'roles.update', 'roles.update'),
  ('roles', 'role', 'delete', 'roles.delete', 'roles.delete'),
  ('roles', 'permission', 'assign', 'roles.permission.assign', 'roles.permission.assign'),
  ('inventory', 'product', 'create', 'inventory.product.create', 'inventory.product.create'),
  ('inventory', 'product', 'read', 'inventory.product.read', 'inventory.product.read'),
  ('inventory', 'product', 'update', 'inventory.product.update', 'inventory.product.update'),
  ('inventory', 'product', 'delete', 'inventory.product.delete', 'inventory.product.delete'),
  ('inventory', 'product', 'import', 'inventory.product.import', 'inventory.product.import'),
  ('inventory', 'product', 'export', 'inventory.product.export', 'inventory.product.export'),
  ('inventory', 'stock', 'read', 'inventory.stock.read', 'inventory.stock.read'),
  ('inventory', 'stock', 'adjust', 'inventory.stock.adjust', 'inventory.stock.adjust'),
  ('inventory', 'stock_adjustment', 'approve', 'inventory.stock.adjust.approve', 'inventory.stock.adjust.approve'),
  ('inventory', 'stock', 'transfer', 'inventory.stock.transfer', 'inventory.stock.transfer'),
  ('inventory', 'stock_transfer', 'approve', 'inventory.stock.transfer.approve', 'inventory.stock.transfer.approve'),
  ('inventory', 'stock', 'reserve', 'inventory.stock.reserve', 'inventory.stock.reserve'),
  ('inventory', 'stock', 'count', 'inventory.stock.count', 'inventory.stock.count'),
  ('warehouse', 'warehouse', 'read', 'warehouse.read', 'warehouse.read'),
  ('warehouse', 'warehouse', 'update', 'warehouse.update', 'warehouse.update'),
  ('warehouse', 'receiving', 'create', 'warehouse.receiving.create', 'warehouse.receiving.create'),
  ('warehouse', 'pick', 'execute', 'warehouse.pick.execute', 'warehouse.pick.execute'),
  ('warehouse', 'pack', 'execute', 'warehouse.pack.execute', 'warehouse.pack.execute'),
  ('warehouse', 'ship', 'execute', 'warehouse.ship.execute', 'warehouse.ship.execute'),
  ('warehouse', 'task', 'manage', 'warehouse.task.manage', 'warehouse.task.manage'),
  ('warehouse', 'slotting', 'view', 'warehouse.slotting.view', 'warehouse.slotting.view'),
  ('warehouse', 'slotting', 'configure', 'warehouse.slotting.configure', 'warehouse.slotting.configure'),
  ('warehouse', 'slotting', 'run', 'warehouse.slotting.run', 'warehouse.slotting.run'),
  ('warehouse', 'slotting', 'approve', 'warehouse.slotting.approve', 'warehouse.slotting.approve'),
  ('warehouse', 'slotting', 'tasks.create', 'warehouse.slotting.tasks.create', 'warehouse.slotting.tasks.create'),
  ('warehouse', 'slotting', 'export', 'warehouse.slotting.export', 'warehouse.slotting.export'),
  ('warehouse', 'slotting', 'analytics', 'warehouse.slotting.analytics', 'warehouse.slotting.analytics'),
  ('warehouse', 'tasks', 'view', 'warehouse.tasks.view', 'warehouse.tasks.view'),
  ('warehouse', 'tasks', 'create', 'warehouse.tasks.create', 'warehouse.tasks.create'),
  ('warehouse', 'tasks', 'update', 'warehouse.tasks.update', 'warehouse.tasks.update'),
  ('warehouse', 'tasks', 'delete', 'warehouse.tasks.delete', 'warehouse.tasks.delete'),
  ('warehouse', 'tasks', 'assign', 'warehouse.tasks.assign', 'warehouse.tasks.assign'),
  ('warehouse', 'tasks', 'complete', 'warehouse.tasks.complete', 'warehouse.tasks.complete'),
  ('warehouse', 'tasks', 'templates.manage', 'warehouse.tasks.templates.manage', 'warehouse.tasks.templates.manage'),
  ('warehouse', 'tasks', 'import', 'warehouse.tasks.import', 'warehouse.tasks.import'),
  ('warehouse', 'tasks', 'export', 'warehouse.tasks.export', 'warehouse.tasks.export'),
  ('warehouse', 'tasks', 'analytics', 'warehouse.tasks.analytics', 'warehouse.tasks.analytics'),
  ('procurement', 'supplier', 'create', 'procurement.supplier.create', 'procurement.supplier.create'),
  ('procurement', 'supplier', 'read', 'procurement.supplier.read', 'procurement.supplier.read'),
  ('procurement', 'supplier', 'update', 'procurement.supplier.update', 'procurement.supplier.update'),
  ('procurement', 'po', 'create', 'procurement.po.create', 'procurement.po.create'),
  ('procurement', 'po', 'read', 'procurement.po.read', 'procurement.po.read'),
  ('procurement', 'po', 'update', 'procurement.po.update', 'procurement.po.update'),
  ('procurement', 'po', 'approve', 'procurement.po.approve', 'procurement.po.approve'),
  ('procurement', 'po', 'cancel', 'procurement.po.cancel', 'procurement.po.cancel'),
  ('procurement', 'po', 'receive', 'procurement.po.receive', 'procurement.po.receive'),
  ('procurement', 'receiving', 'create', 'procurement.receiving.create', 'procurement.receiving.create'),
  ('procurement', 'receiving', 'read', 'procurement.receiving.read', 'procurement.receiving.read'),
  ('procurement', 'supplier', 'delete', 'procurement.supplier.delete', 'procurement.supplier.delete'),
  ('procurement', 'supplier.contacts', 'manage', 'procurement.supplier.contacts.manage', 'procurement.supplier.contacts.manage'),
  ('procurement', 'supplier.pricing', 'manage', 'procurement.supplier.pricing.manage', 'procurement.supplier.pricing.manage'),
  ('procurement', 'supplier.documents', 'manage', 'procurement.supplier.documents.manage', 'procurement.supplier.documents.manage'),
  ('sales', 'customer', 'create', 'sales.customer.create', 'sales.customer.create'),
  ('sales', 'customer', 'read', 'sales.customer.read', 'sales.customer.read'),
  ('sales', 'customer', 'update', 'sales.customer.update', 'sales.customer.update'),
  ('sales', 'quote', 'read', 'sales.quote.read', 'sales.quote.read'),
  ('sales', 'quote', 'update', 'sales.quote.update', 'sales.quote.update'),
  ('sales', 'order', 'create', 'sales.order.create', 'sales.order.create'),
  ('sales', 'order', 'read', 'sales.order.read', 'sales.order.read'),
  ('sales', 'order', 'update', 'sales.order.update', 'sales.order.update'),
  ('sales', 'order', 'approve', 'sales.order.approve', 'sales.order.approve'),
  ('sales', 'quote', 'create', 'sales.quote.create', 'sales.quote.create'),
  ('sales', 'invoice', 'create', 'sales.invoice.create', 'sales.invoice.create'),
  ('shipment', 'shipment', 'read', 'shipment.read', 'shipment.read'),
  ('shipment', 'shipment', 'dispatch', 'shipment.dispatch', 'shipment.dispatch'),
  ('shipment', 'shipment', 'update', 'shipment.update', 'shipment.update'),
  ('delivery', 'delivery', 'read', 'delivery.read', 'delivery.read'),
  ('delivery', 'delivery', 'manage', 'delivery.manage', 'delivery.manage'),
  ('returns', 'rma', 'create', 'returns.rma.create', 'returns.rma.create'),
  ('returns', 'rma', 'read', 'returns.rma.read', 'returns.rma.read'),
  ('returns', 'rma', 'inspect', 'returns.rma.inspect', 'returns.rma.inspect'),
  ('returns', 'rma', 'approve', 'returns.rma.approve', 'returns.rma.approve'),
  ('quality', 'inspection', 'create', 'quality.inspection.create', 'quality.inspection.create'),
  ('quality', 'inspection', 'read', 'quality.inspection.read', 'quality.inspection.read'),
  ('quality', 'quarantine', 'manage', 'quality.quarantine.manage', 'quality.quarantine.manage'),
  ('quality', 'recall', 'manage', 'quality.recall.manage', 'quality.recall.manage'),
  ('tax', 'rule', 'create', 'tax.rule.create', 'tax.rule.create'),
  ('tax', 'rule', 'read', 'tax.rule.read', 'tax.rule.read'),
  ('tax', 'rule', 'update', 'tax.rule.update', 'tax.rule.update'),
  ('tax', 'rule', 'deactivate', 'tax.rule.deactivate', 'tax.rule.deactivate'),
  ('tax', 'calculation', 'execute', 'tax.calculate', 'tax.calculate'),
  ('tax', 'profile', 'read', 'tax.profile.read', 'tax.profile.read'),
  ('tax', 'profile', 'update', 'tax.profile.update', 'tax.profile.update'),
  ('tax', 'snapshot', 'read', 'tax.snapshot.read', 'tax.snapshot.read'),
  ('tax', 'report', 'read', 'tax.report.read', 'tax.report.read'),
  ('finance', 'ap', 'read', 'finance.ap.read', 'finance.ap.read'),
  ('finance', 'ar', 'read', 'finance.ar.read', 'finance.ar.read'),
  ('finance', 'payment', 'approve', 'finance.payment.approve', 'finance.payment.approve'),
  ('finance', 'payment', 'reconcile', 'finance.payment.reconcile', 'finance.payment.reconcile'),
  ('finance', 'journal', 'post', 'finance.journal.post', 'finance.journal.post'),
  ('finance', 'report', 'read', 'finance.report.read', 'finance.report.read'),
  ('billing', 'subscription', 'read', 'billing.subscription.read', 'billing.subscription.read'),
  ('billing', 'subscription', 'update', 'billing.subscription.update', 'billing.subscription.update'),
  ('billing', 'subscription', 'activate', 'billing.subscription.activate', 'billing.subscription.activate'),
  ('billing', 'invoice', 'read', 'billing.invoice.read', 'billing.invoice.read'),
  ('reports', 'dashboard', 'read', 'reports.dashboard.read', 'reports.dashboard.read'),
  ('reports', 'report', 'read', 'reports.report.read', 'reports.report.read'),
  ('reports', 'report', 'export', 'reports.report.export', 'reports.report.export'),
  ('audit', 'log', 'create', 'audit.log.create', 'audit.log.create'),
  ('audit', 'log', 'read', 'audit.log.read', 'audit.log.read'),
  ('activity', 'log', 'create', 'activity.log.create', 'activity.log.create'),
  ('activity', 'log', 'read', 'activity.log.read', 'activity.log.read'),
  ('file', 'storage', 'sign', 'file.storage.sign', 'file.storage.sign'),
  ('docs', 'document', 'create', 'docs.document.create', 'docs.document.create'),
  ('docs', 'document', 'read', 'docs.document.read', 'docs.document.read'),
  ('docs', 'document', 'update', 'docs.document.update', 'docs.document.update'),
  ('docs', 'document', 'delete', 'docs.document.delete', 'docs.document.delete'),
  ('docs', 'document', 'sign', 'docs.document.sign', 'docs.document.sign'),
  ('notify', 'notification', 'read', 'notify.notification.read', 'notify.notification.read'),
  ('notify', 'notification', 'manage', 'notify.notification.manage', 'notify.notification.manage'),
  ('notify', 'template', 'manage', 'notify.template.manage', 'notify.template.manage'),
  ('workflow', 'approval', 'create', 'workflow.approval.create', 'workflow.approval.create'),
  ('workflow', 'approval', 'read', 'workflow.approval.read', 'workflow.approval.read'),
  ('workflow', 'approval', 'decide', 'workflow.approval.decide', 'workflow.approval.decide'),
  ('workflow', 'approval', 'override', 'workflow.approval.override', 'workflow.approval.override'),
  ('organization', 'member', 'invite', 'organization.member.invite', 'organization.member.invite'),
  ('organization', 'role', 'assign', 'organization.role.assign', 'organization.role.assign'),
  ('organization', 'organization', 'activate', 'organization.activate', 'organization.activate'),
  ('organization', 'organization', 'suspend', 'organization.suspend', 'organization.suspend'),
  ('organization', 'warehouse', 'link', 'organization.warehouse.link', 'organization.warehouse.link'),
  ('tenant', 'organization', 'manage', 'tenant.organization.manage', 'tenant.organization.manage'),
  ('tenant', 'settings', 'manage', 'tenant.settings.manage', 'tenant.settings.manage'),
  ('tenant', 'access', 'manage', 'tenant.access.manage', 'tenant.access.manage'),
  ('tenant', 'lifecycle', 'manage', 'tenant.lifecycle.manage', 'tenant.lifecycle.manage'),
  ('tenant', 'subscription', 'manage', 'tenant.subscription.manage', 'tenant.subscription.manage'),
  ('workflow', 'definition', 'manage', 'workflow.definition.manage', 'workflow.definition.manage'),
  ('workflow', 'definition', 'read', 'workflow.definition.read', 'workflow.definition.read'),
  ('workflow', 'request', 'create', 'workflow.request.create', 'workflow.request.create'),
  ('workflow', 'request', 'read', 'workflow.request.read', 'workflow.request.read'),
  ('workflow', 'request', 'complete', 'workflow.request.complete', 'workflow.request.complete'),
  ('workflow', 'request', 'transition', 'workflow.request.transition', 'workflow.request.transition'),
  ('workflow', 'approval', 'escalate', 'workflow.approval.escalate', 'workflow.approval.escalate'),
  ('workflow', 'approval', 'reassign', 'workflow.approval.reassign', 'workflow.approval.reassign'),
  ('api', 'api_key', 'read', 'api.key.read', 'api.key.read'),
  ('api', 'api_key', 'update', 'api.key.update', 'api.key.update'),
  ('api', 'api_key', 'create', 'api.key.create', 'api.key.create'),
  ('api', 'api_key', 'revoke', 'api.key.revoke', 'api.key.revoke'),
  ('api', 'webhook', 'manage', 'api.webhook.manage', 'api.webhook.manage'),
  ('integration', 'integration', 'read', 'integration.read', 'integration.read'),
  ('integration', 'integration', 'manage', 'integration.manage', 'integration.manage'),
  ('mobile', 'sync', 'execute', 'mobile.sync.execute', 'mobile.sync.execute'),
  ('support', 'ticket', 'create', 'support.ticket.create', 'support.ticket.create'),
  ('support', 'ticket', 'read', 'support.ticket.read', 'support.ticket.read'),
  ('support', 'ticket', 'update', 'support.ticket.update', 'support.ticket.update'),
  ('help', 'article', 'read', 'help.article.read', 'help.article.read'),
  ('help', 'article', 'manage', 'help.article.manage', 'help.article.manage'),
  ('audit', 'log', 'export', 'audit.log.export', 'audit.log.export'),
  ('warehouse', 'stock_take', 'view', 'stock_take.view', 'stock_take.view'),
  ('warehouse', 'stock_take', 'create', 'stock_take.create', 'stock_take.create'),
  ('warehouse', 'stock_take', 'edit', 'stock_take.edit', 'stock_take.edit'),
  ('warehouse', 'stock_take', 'schedule', 'stock_take.schedule', 'stock_take.schedule'),
  ('warehouse', 'stock_take', 'start', 'stock_take.start', 'stock_take.start'),
  ('warehouse', 'stock_take', 'complete', 'stock_take.complete', 'stock_take.complete'),
  ('warehouse', 'stock_take', 'approve', 'stock_take.approve', 'stock_take.approve'),
  ('warehouse', 'stock_take', 'lock', 'stock_take.lock', 'stock_take.lock'),
  ('warehouse', 'stock_take', 'export', 'stock_take.export', 'stock_take.export');

WITH permission_group_map AS (
  SELECT DISTINCT ON (module_name) id, module_name
  FROM permission_groups
  WHERE module_name IS NOT NULL
  ORDER BY module_name, sort_order NULLS LAST, id
)
UPDATE permissions target
SET permission_group_id = permission_group_map.id,
    module = source.module_name,
    resource = source.resource,
    action = source.action,
    description = source.description
FROM seed_permissions source
JOIN permission_group_map ON permission_group_map.module_name = source.module_name
WHERE target.permission_key = source.permission_key;

WITH permission_group_map AS (
  SELECT DISTINCT ON (module_name) id, module_name
  FROM permission_groups
  WHERE module_name IS NOT NULL
  ORDER BY module_name, sort_order NULLS LAST, id
), seed_permission_rows AS (
  SELECT DISTINCT ON (source.permission_key)
         permission_group_map.id AS permission_group_id,
         source.module_name,
         source.resource,
         source.action,
         source.permission_key,
         source.description
  FROM seed_permissions source
  JOIN permission_group_map ON permission_group_map.module_name = source.module_name
  ORDER BY source.permission_key
)
INSERT INTO permissions (id, permission_group_id, module, resource, action, permission_key, description, created_at)
SELECT gen_random_uuid(), source.permission_group_id, source.module_name, source.resource,
       source.action, source.permission_key, source.description, now()
FROM seed_permission_rows source
WHERE NOT EXISTS (
  SELECT 1 FROM permissions target WHERE target.permission_key = source.permission_key
);

COMMIT;
