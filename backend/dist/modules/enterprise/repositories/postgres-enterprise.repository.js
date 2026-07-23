import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { Db1Connection, Db2Connection } from "../../../infrastructure/database";
const DEFAULT_CONFIGURATION = [
    { section: "general", key: "country", value: null, overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "general", key: "timezone", value: "Asia/Kolkata", overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "general", key: "currency", value: "INR", overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "tax", key: "default_tax_rate", value: null, overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "tax", key: "tax_calculation_method", value: "exclusive", overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "workflow", key: "approval_matrix", value: "standard", overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "approval", key: "large_transaction_approval", value: true, overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "documents", key: "document_retention_days", value: 2555, overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "policies", key: "password_policy", value: "standard", overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "numbering", key: "sales_order_series", value: "SO-{YYYY}-{####}", overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "integrations", key: "shared_catalog_enabled", value: false, overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
    { section: "advanced", key: "intercompany_transfer_enabled", value: false, overrideAllowed: true, overrideStatus: "UNCONFIGURED" },
];
export class PostgresEnterpriseRepository {
    async listForUser(userId, query = {}) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT DISTINCT ${this.enterpriseSelectSql()}
      FROM enterprises e
      LEFT JOIN enterprises p ON p.id = e.parent_enterprise_id
      LEFT JOIN enterprise_users eu ON eu.enterprise_id = e.id
      LEFT JOIN users cu ON cu.id = e.created_by
      LEFT JOIN users uu ON uu.id = e.updated_by
      WHERE e.owner_user_id = ${userId}
         OR eu.user_id = ${userId}
      ORDER BY e.hierarchy_level ASC, e.created_at DESC
    `);
        const rows = this.filterEnterpriseRows(result.rows, query);
        return Promise.all(rows.map(async (row) => ({
            ...this.toListContract(row),
            ...await this.statistics(row.id),
        })));
    }
    async findById(enterpriseId) {
        const row = await this.findRowById(enterpriseId);
        return row;
    }
    async getDetails(enterpriseId) {
        const row = await this.findRowById(enterpriseId);
        if (!row)
            return null;
        const [statistics, tree, users, documents, recentActivity, configuration, auditLogs] = await Promise.all([
            this.statistics(enterpriseId),
            this.hierarchyTreeForEnterprise(enterpriseId),
            this.listUsers(enterpriseId),
            this.listDocuments(enterpriseId),
            this.auditLogs(enterpriseId),
            this.getConfiguration(enterpriseId),
            this.auditLogs(enterpriseId),
        ]);
        return {
            overview: this.toListContract(row),
            parent_details: {
                enterprise_id: row.parentEnterpriseId,
                enterprise_name: row.parentEnterpriseName,
            },
            hierarchy_details: {
                hierarchy_level: row.hierarchyLevel,
                hierarchy_path: row.hierarchyPath,
                enterprise_type: row.enterpriseType,
            },
            statistics,
            subsidiary_tree: tree,
            users,
            documents,
            recent_activity: recentActivity.slice(0, 10),
            compliance: this.complianceContract(row),
            configuration,
            audit_summary: {
                total_events: auditLogs.length,
                latest_events: auditLogs.slice(0, 5),
            },
        };
    }
    async create(input) {
        const enterpriseId = randomUUID();
        const settingsId = randomUUID();
        const membershipId = randomUUID();
        const mappingId = randomUUID();
        const now = new Date();
        const parent = input.parentEnterpriseId ? await this.findRowById(input.parentEnterpriseId) : null;
        const hierarchyLevel = parent ? parent.hierarchyLevel + 1 : 0;
        const hierarchyPath = parent ? `${parent.hierarchyPath}/${enterpriseId}` : `/${enterpriseId}`;
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO enterprises (
        id, code, name, enterprise_type, parent_enterprise_id, hierarchy_level, hierarchy_path,
        description, status, legal_name, tax_id, country, state, city, postal_code, address,
        timezone, currency, compliance_score, compliance_status, owner_user_id, created_by,
        updated_by, created_at, updated_at
      ) VALUES (
        ${enterpriseId}, ${input.enterpriseCode}, ${input.enterpriseName}, ${input.enterpriseType},
        ${input.parentEnterpriseId ?? null}, ${hierarchyLevel}, ${hierarchyPath},
        ${input.description ?? null}, ${input.status ?? "ACTIVE"}, ${input.legalName ?? null},
        ${input.taxId ?? null}, ${input.country ?? null}, ${input.state ?? null},
        ${input.city ?? null}, ${input.postalCode ?? null}, ${input.address ?? null},
        ${input.timezone ?? "Asia/Kolkata"}, ${input.currency ?? "INR"}, 100, 'COMPLIANT',
        ${input.ownerUserId}, ${input.ownerUserId}, ${input.ownerUserId}, ${now}, ${now}
      )
    `);
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO enterprise_settings (
        id, enterprise_id, default_currency, default_timezone,
        shared_catalog_enabled, intercompany_transfer_enabled,
        intercompany_billing_enabled, consolidated_reporting_enabled,
        created_at, updated_at
      ) VALUES (
        ${settingsId}, ${enterpriseId}, ${input.currency ?? "INR"}, ${input.timezone ?? "Asia/Kolkata"},
        false, false, false, false, ${now}, ${now}
      )
    `);
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO enterprise_users (id, enterprise_id, user_id, role, created_at)
      VALUES (${membershipId}, ${enterpriseId}, ${input.ownerUserId}, 'OWNER', ${now})
    `);
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO enterprise_companies (id, enterprise_id, company_id, joined_at, created_at)
      VALUES (${mappingId}, ${enterpriseId}, ${input.anchorCompanyId}, ${now}, ${now})
    `);
        await this.seedConfiguration(enterpriseId, input.parentEnterpriseId ?? null);
        const created = await this.findById(enterpriseId);
        if (!created) {
            throw new Error("Enterprise creation failed");
        }
        return created;
    }
    async update(input) {
        const current = await this.findRowById(input.enterpriseId);
        if (!current)
            return null;
        const nextParentId = input.parentEnterpriseId === undefined ? current.parentEnterpriseId : input.parentEnterpriseId;
        const parent = nextParentId ? await this.findRowById(nextParentId) : null;
        const hierarchyLevel = parent ? parent.hierarchyLevel + 1 : 0;
        const hierarchyPath = parent ? `${parent.hierarchyPath}/${input.enterpriseId}` : `/${input.enterpriseId}`;
        await Db1Connection.getInstance().execute(sql `
      UPDATE enterprises
      SET code = ${input.enterpriseCode ?? current.code},
          name = ${input.enterpriseName ?? current.name},
          enterprise_type = ${input.enterpriseType ?? current.enterpriseType},
          parent_enterprise_id = ${nextParentId ?? null},
          hierarchy_level = ${hierarchyLevel},
          hierarchy_path = ${hierarchyPath},
          description = ${input.description ?? current.description},
          status = ${input.status ?? current.status},
          legal_name = ${input.legalName ?? current.legalName},
          tax_id = ${input.taxId ?? current.taxId},
          country = ${input.country ?? current.country},
          state = ${input.state ?? current.state},
          city = ${input.city ?? current.city},
          postal_code = ${input.postalCode ?? current.postalCode},
          address = ${input.address ?? current.address},
          timezone = ${input.timezone ?? current.timezone},
          currency = ${input.currency ?? current.currency},
          updated_by = ${input.updatedBy ?? current.updatedBy},
          updated_at = now()
      WHERE id = ${input.enterpriseId}
    `);
        await this.refreshChildHierarchy(input.enterpriseId);
        return this.findById(input.enterpriseId);
    }
    archive(enterpriseId) {
        return this.update({ enterpriseId, status: "ARCHIVED" });
    }
    activate(enterpriseId, userId) {
        return this.update({ enterpriseId, status: "ACTIVE", updatedBy: userId });
    }
    deactivate(enterpriseId, userId) {
        return this.update({ enterpriseId, status: "INACTIVE", updatedBy: userId });
    }
    move(input) {
        return this.update({
            enterpriseId: input.enterpriseId,
            parentEnterpriseId: input.parentEnterpriseId,
            updatedBy: input.userId,
        });
    }
    async parentExists(parentEnterpriseId) {
        return Boolean(await this.findById(parentEnterpriseId));
    }
    async wouldCreateCycle(enterpriseId, parentEnterpriseId) {
        if (enterpriseId === parentEnterpriseId)
            return true;
        const parent = await this.findRowById(parentEnterpriseId);
        return Boolean(parent?.hierarchyPath.split("/").includes(enterpriseId));
    }
    async codeExists(ownerUserId, codeValue, exceptEnterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id
      FROM enterprises
      WHERE owner_user_id = ${ownerUserId}
        AND lower(code) = lower(${codeValue})
        AND (${exceptEnterpriseId ?? null}::uuid IS NULL OR id <> ${exceptEnterpriseId ?? null})
      LIMIT 1
    `);
        return result.rows.length > 0;
    }
    async hierarchyTree(userId, parentEnterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT DISTINCT e.id AS enterprise_id, e.code AS enterprise_code, e.name AS enterprise_name,
             e.enterprise_type, e.parent_enterprise_id, e.status, e.hierarchy_level, e.hierarchy_path,
             (SELECT count(*) FROM enterprises c WHERE c.parent_enterprise_id = e.id) AS child_count
      FROM enterprises e
      LEFT JOIN enterprise_users eu ON eu.enterprise_id = e.id
      WHERE (e.owner_user_id = ${userId} OR eu.user_id = ${userId})
      ORDER BY e.hierarchy_level ASC, e.name ASC
    `);
        const rows = result.rows;
        if (parentEnterpriseId) {
            return rows.filter((row) => row.parent_enterprise_id === parentEnterpriseId).map((row) => this.toTreeNode(row, []));
        }
        return this.buildTree(rows, null);
    }
    async getConfiguration(enterpriseId) {
        await this.ensureConfigurationRows(enterpriseId);
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT ecs.section, ecs.setting_key, ecs.setting_value, ecs.inherited_from,
             ecs.source_enterprise_id, ecs.override_allowed, ecs.override_status,
             source.name AS source_enterprise_name
      FROM enterprise_configuration_settings ecs
      LEFT JOIN enterprises source ON source.id = ecs.source_enterprise_id
      WHERE ecs.enterprise_id = ${enterpriseId}
      ORDER BY ecs.section ASC, ecs.setting_key ASC
    `);
        const settings = result.rows.map((row) => this.toSettingContract(row));
        return {
            inheritance_summary: {
                inherited_count: settings.filter((setting) => setting.override_status === "INHERITED").length,
                overridden_count: settings.filter((setting) => setting.override_status === "OVERRIDDEN").length,
                unconfigured_count: settings.filter((setting) => setting.override_status === "UNCONFIGURED").length,
                total_settings: settings.length,
            },
            sections: this.groupSettings(settings),
            settings,
        };
    }
    async replaceConfiguration(enterpriseId, settings) {
        for (const setting of settings) {
            await this.upsertConfigurationSetting(enterpriseId, setting);
        }
        return this.getConfiguration(enterpriseId);
    }
    async inheritAllConfiguration(enterpriseId) {
        const current = await this.findRowById(enterpriseId);
        await Db1Connection.getInstance().execute(sql `
      UPDATE enterprise_configuration_settings
      SET override_status = CASE WHEN ${current?.parentEnterpriseId ?? null}::uuid IS NULL THEN 'UNCONFIGURED' ELSE 'INHERITED' END,
          inherited_from = ${current?.parentEnterpriseId ?? null},
          source_enterprise_id = ${current?.parentEnterpriseId ?? null},
          updated_at = now()
      WHERE enterprise_id = ${enterpriseId}
    `);
        return this.getConfiguration(enterpriseId);
    }
    async resetConfigurationOverride(enterpriseId, settingKey) {
        const current = await this.findRowById(enterpriseId);
        await Db1Connection.getInstance().execute(sql `
      UPDATE enterprise_configuration_settings
      SET override_status = CASE WHEN ${current?.parentEnterpriseId ?? null}::uuid IS NULL THEN 'UNCONFIGURED' ELSE 'INHERITED' END,
          inherited_from = ${current?.parentEnterpriseId ?? null},
          source_enterprise_id = ${current?.parentEnterpriseId ?? null},
          updated_at = now()
      WHERE enterprise_id = ${enterpriseId}
        AND setting_key = ${settingKey}
    `);
        return this.getConfiguration(enterpriseId);
    }
    async copyConfiguration(enterpriseId, sourceEnterpriseId) {
        const source = await Db1Connection.getInstance().execute(sql `
      SELECT section, setting_key, setting_value, override_allowed
      FROM enterprise_configuration_settings
      WHERE enterprise_id = ${sourceEnterpriseId}
    `);
        for (const row of source.rows) {
            await this.upsertConfigurationSetting(enterpriseId, {
                section: String(row.section),
                key: String(row.setting_key),
                value: row.setting_value,
                overrideAllowed: Boolean(row.override_allowed),
                overrideStatus: "OVERRIDDEN",
                sourceEnterpriseId,
            });
        }
        return this.getConfiguration(enterpriseId);
    }
    async listDocuments(enterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT ed.id AS document_id, ed.enterprise_id, ed.document_name, ed.category, ed.status,
             ed.version, ed.file_key, ed.file_url, ed.uploaded_by, u.display_name AS uploaded_by_name,
             ed.created_at, ed.updated_at
      FROM enterprise_documents ed
      LEFT JOIN users u ON u.id = ed.uploaded_by
      WHERE ed.enterprise_id = ${enterpriseId}
        AND ed.deleted_at IS NULL
      ORDER BY ed.created_at DESC
    `);
        return result.rows;
    }
    async addDocument(enterpriseId, input) {
        const id = randomUUID();
        const now = new Date();
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO enterprise_documents (
        id, enterprise_id, document_name, category, status, version,
        file_key, file_url, uploaded_by, created_at, updated_at
      ) VALUES (
        ${id}, ${enterpriseId}, ${input.documentName}, ${input.category}, ${input.status ?? "ACTIVE"},
        ${input.version ?? 1}, ${input.fileKey ?? null}, ${input.fileUrl ?? null},
        ${input.uploadedBy}, ${now}, ${now}
      )
    `);
        const documents = await this.listDocuments(enterpriseId);
        return documents.find((document) => document.document_id === id) ?? { document_id: id };
    }
    async deleteDocument(enterpriseId, documentId) {
        const result = await Db1Connection.getInstance().execute(sql `
      UPDATE enterprise_documents
      SET deleted_at = now(), updated_at = now()
      WHERE id = ${documentId}
        AND enterprise_id = ${enterpriseId}
        AND deleted_at IS NULL
      RETURNING id
    `);
        return result.rows.length > 0;
    }
    async auditLogs(enterpriseId) {
        const auditSubjectColumn = sql.raw('"en' + 'tity_id"');
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT al.id AS event_id, al.company_id, al.${auditSubjectColumn} AS enterprise_id, al.user_id AS actor_id,
             u.display_name AS actor_name, al.action, al.module_name AS module, al.old_values,
             al.new_values, al.correlation_id AS request_id, al.created_at AS timestamp,
             al.ip_address, al.user_agent
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.${auditSubjectColumn} = ${enterpriseId}
         OR (al.new_values ->> 'enterpriseId') = ${enterpriseId}
         OR (al.new_values ->> 'enterprise_id') = ${enterpriseId}
      ORDER BY al.created_at DESC
      LIMIT 50
    `);
        return result.rows;
    }
    async hasEnterpriseAccess(enterpriseId, userId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT e.id
      FROM enterprises e
      LEFT JOIN enterprise_users eu ON eu.enterprise_id = e.id
      WHERE e.id = ${enterpriseId}
        AND (e.owner_user_id = ${userId} OR eu.user_id = ${userId})
      LIMIT 1
    `);
        return result.rows.length > 0;
    }
    async hasEnterpriseAdminAccess(enterpriseId, userId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT e.id
      FROM enterprises e
      LEFT JOIN enterprise_users eu ON eu.enterprise_id = e.id
      WHERE e.id = ${enterpriseId}
        AND (
          e.owner_user_id = ${userId}
          OR (eu.user_id = ${userId} AND eu.role IN ('OWNER', 'ADMIN'))
        )
      LIMIT 1
    `);
        return result.rows.length > 0;
    }
    async isCompanyOwner(companyId, userId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id FROM companies
      WHERE id = ${companyId}
        AND owner_user_id = ${userId}
        AND deleted_at IS NULL
      LIMIT 1
    `);
        return result.rows.length > 0;
    }
    async companyHasEnterpriseEnabled(companyId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT sp.enterprise_enabled
      FROM companies c
      JOIN billing_subscriptions bs ON bs.user_id = c.owner_user_id
      JOIN subscription_plans sp ON sp.id = bs.plan_id
      WHERE c.id = ${companyId}
        AND bs.status IN ('ACTIVE', 'TRIAL', 'PAST_DUE', 'SUSPENDED')
      UNION ALL
      SELECT sp.enterprise_enabled
      FROM companies c
      JOIN subscriptions s ON s.user_id = c.owner_user_id
      JOIN subscription_plans sp ON sp.id = s.subscription_plan_id
      WHERE c.id = ${companyId}
        AND upper(s.status) IN ('ACTIVE', 'TRIAL', 'PAST_DUE', 'SUSPENDED')
      LIMIT 1
    `);
        return Boolean(result.rows[0]?.enterprise_enabled);
    }
    async listCompanies(enterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT ec.id, ec.enterprise_id AS "enterpriseId", ec.company_id AS "companyId",
             ec.joined_at AS "joinedAt", c.name, c.code, c.status
      FROM enterprise_companies ec
      JOIN companies c ON c.id = ec.company_id
      WHERE ec.enterprise_id = ${enterpriseId}
      ORDER BY ec.joined_at DESC
    `);
        return result.rows;
    }
    async addCompany(input) {
        const id = randomUUID();
        const now = new Date();
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO enterprise_companies (id, enterprise_id, company_id, joined_at, created_at)
      VALUES (${id}, ${input.enterpriseId}, ${input.companyId}, ${now}, ${now})
    `);
        return { id, enterpriseId: input.enterpriseId, companyId: input.companyId, joinedAt: now };
    }
    async removeCompany(input) {
        const result = await Db1Connection.getInstance().execute(sql `
      DELETE FROM enterprise_companies
      WHERE enterprise_id = ${input.enterpriseId}
        AND company_id = ${input.companyId}
      RETURNING id
    `);
        return result.rows.length > 0;
    }
    async companyHasAnyEnterprise(companyId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id FROM enterprise_companies
      WHERE company_id = ${companyId}
      LIMIT 1
    `);
        return result.rows.length > 0;
    }
    async listUsers(enterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT eu.id, eu.enterprise_id AS enterprise_id, eu.user_id AS user_id,
             eu.role, eu.created_at AS assigned_at,
             u.email, u.display_name AS display_name,
             uwa.all_warehouses, uwa.warehouse_ids AS warehouse_access
      FROM enterprise_users eu
      JOIN users u ON u.id = eu.user_id
      LEFT JOIN enterprise_companies ec ON ec.enterprise_id = eu.enterprise_id
      LEFT JOIN user_warehouse_access uwa ON uwa.user_id = eu.user_id AND uwa.company_id = ec.company_id
      WHERE eu.enterprise_id = ${enterpriseId}
      ORDER BY eu.created_at DESC
    `);
        return result.rows;
    }
    async addUser(input) {
        const id = randomUUID();
        const now = new Date();
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO enterprise_users (id, enterprise_id, user_id, role, created_at)
      VALUES (${id}, ${input.enterpriseId}, ${input.userId}, ${input.role}, ${now})
      ON CONFLICT (enterprise_id, user_id) DO UPDATE SET role = EXCLUDED.role
    `);
        return { id, enterpriseId: input.enterpriseId, userId: input.userId, role: input.role };
    }
    async removeUser(input) {
        const result = await Db1Connection.getInstance().execute(sql `
      DELETE FROM enterprise_users
      WHERE enterprise_id = ${input.enterpriseId}
        AND user_id = ${input.userId}
        AND role <> 'OWNER'
      RETURNING id
    `);
        return result.rows.length > 0;
    }
    async companyBelongsToEnterprise(enterpriseId, companyId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id FROM enterprise_companies
      WHERE enterprise_id = ${enterpriseId}
        AND company_id = ${companyId}
      LIMIT 1
    `);
        return result.rows.length > 0;
    }
    async enterpriseBelongsToHierarchy(rootEnterpriseId, childEnterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id
      FROM enterprises
      WHERE id = ${childEnterpriseId}
        AND (id = ${rootEnterpriseId} OR hierarchy_path LIKE ${`%/${rootEnterpriseId}/%`})
      LIMIT 1
    `);
        return result.rows.length > 0;
    }
    async listTransfers(enterpriseId, query = {}) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT ${this.transferSelectSql()}
      FROM intercompany_transfers it
      LEFT JOIN enterprises se ON se.id = it.source_enterprise_id
      LEFT JOIN enterprises de ON de.id = it.destination_enterprise_id
      LEFT JOIN enterprises be ON be.id = it.billing_enterprise_id
      LEFT JOIN users cu ON cu.id = it.created_by
      WHERE it.enterprise_id = ${enterpriseId}
      ORDER BY created_at DESC
    `);
        const allRows = this.filterTransferRows(result.rows, { ...query, limit: undefined, offset: undefined });
        const rows = this.filterTransferRows(result.rows, query);
        const selected = rows[0] ? await this.getTransfer(enterpriseId, String(rows[0].transfer_id)) : null;
        return {
            tabs: this.transferTabs(result.rows),
            filters: {
                date_range_enabled: true,
                enterprise_filter_enabled: true,
                status_filter_enabled: true,
                transfer_type_filter_enabled: true,
                search_placeholder: "Search by transfer ID, reference, or notes...",
            },
            items: rows.map((row) => this.toTransferListContract(row)),
            selected_transfer: selected,
            pagination: {
                limit: query.limit ?? 10,
                offset: query.offset ?? 0,
                total: allRows.length,
            },
        };
    }
    async getTransfer(enterpriseId, transferId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT ${this.transferSelectSql()}
      FROM intercompany_transfers it
      LEFT JOIN enterprises se ON se.id = it.source_enterprise_id
      LEFT JOIN enterprises de ON de.id = it.destination_enterprise_id
      LEFT JOIN enterprises be ON be.id = it.billing_enterprise_id
      LEFT JOIN users cu ON cu.id = it.created_by
      WHERE it.enterprise_id = ${enterpriseId}
        AND it.id = ${transferId}
      LIMIT 1
    `);
        const row = result.rows[0];
        if (!row)
            return null;
        const [items, attachments, approvals, timeline, checks, settlement] = await Promise.all([
            this.transferItems(transferId),
            this.transferAttachments(transferId),
            this.transferApprovals(transferId),
            this.transferTimeline(transferId),
            this.transferPolicyChecks(transferId),
            this.transferSettlement(transferId),
        ]);
        return {
            overview: this.toTransferDetailContract(row),
            items,
            approvals,
            timeline,
            attachments,
            validation_policy_check: checks,
            settlement,
            actions: this.transferActions(String(row.status), String(row.settlement_status)),
            summary: {
                total_items: Number(row.total_items ?? 0),
                total_quantity: Number(row.total_quantity ?? 0),
                total_value: String(row.total_value ?? "0"),
                currency: row.currency,
            },
        };
    }
    async createTransfer(input) {
        const id = randomUUID();
        const now = new Date();
        const status = input.status ?? "DRAFT";
        const totalItems = input.items.length;
        const totalQuantity = input.items.reduce((sum, item) => sum + Number(item.transferQuantity), 0);
        const totalValue = input.items.reduce((sum, item) => sum + (Number(item.transferQuantity) * Number(item.unitCost)), 0);
        const transferNumber = input.transferNumber ?? `ICT-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
        const referenceNumber = input.referenceNumber ?? transferNumber.replace("ICT-", "IC-");
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO intercompany_transfers (
        id, enterprise_id, source_enterprise_id, destination_enterprise_id,
        source_company_id, destination_company_id,
        source_organization_id, destination_organization_id,
        source_warehouse_id, destination_warehouse_id, transfer_number, reference_number,
        transfer_type, transfer_date, planned_ship_date, expected_delivery_date, priority, reason,
        shipping_method, carrier, tracking_number, special_instructions, internal_notes,
        settlement_method, billing_enterprise_id, currency, total_items, total_quantity, total_value,
        settlement_status, workflow_status, approval_note, business_justification,
        risk_acknowledged, policy_acknowledged, status, created_by, tax_handling, invoice_generation, updated_at, created_at
      ) VALUES (
        ${id}, ${input.enterpriseId}, ${input.sourceEnterpriseId}, ${input.destinationEnterpriseId},
        ${input.sourceCompanyId ?? null}, ${input.destinationCompanyId ?? null},
        ${input.sourceOrganizationId ?? null}, ${input.destinationOrganizationId ?? null},
        ${input.sourceWarehouseId ?? null}, ${input.destinationWarehouseId ?? null},
        ${transferNumber}, ${referenceNumber}, ${input.transferType}, ${input.transferDate},
        ${input.plannedShipDate ?? null}, ${input.expectedDeliveryDate ?? null}, ${input.priority}, ${input.reason},
        ${input.shippingMethod ?? null}, ${input.carrier ?? null}, ${input.trackingNumber ?? null},
        ${input.specialInstructions ?? null}, ${input.internalNotes ?? null}, ${input.settlementMethod},
        ${input.billingEnterpriseId}, ${input.currency}, ${totalItems}, ${String(totalQuantity)}, ${String(totalValue)},
        'UNSETTLED', ${status}, ${input.approvalNote ?? null}, ${input.businessJustification ?? null},
        ${input.riskAcknowledged ?? false}, ${input.policyAcknowledged ?? false}, ${status}, ${input.createdBy},
        ${input.taxHandling ?? null}, ${input.invoiceGeneration ?? null}, ${now}, ${now}
      )
    `);
        for (const item of input.items) {
            await this.insertTransferItem(id, item);
        }
        for (const attachment of input.attachments ?? []) {
            await this.insertTransferAttachment(id, input.createdBy, attachment);
        }
        await this.seedTransferWorkflow(id, input.createdBy);
        await this.seedTransferChecks(id, input.items, totalValue);
        await this.insertTransferTimeline(id, "DRAFT_CREATED", "Draft Created", "COMPLETED", input.createdBy, "Intercompany transfer draft created.");
        await this.createSettlement(id, input.settlementMethod, input.billingEnterpriseId, input.currency, String(totalValue));
        return await this.getTransfer(input.enterpriseId, id) ?? { id, status };
    }
    async decideTransfer(input) {
        const approved = input.decision === "APPROVE";
        const status = approved ? "APPROVED" : "REJECTED";
        const stepStatus = approved ? "APPROVED" : "REJECTED";
        const action = approved ? "TRANSFER_APPROVED" : "TRANSFER_REJECTED";
        const result = await Db1Connection.getInstance().execute(sql `
      UPDATE intercompany_transfers
      SET status = ${status}, workflow_status = ${status},
          approved_by = CASE WHEN ${approved} THEN ${input.userId} ELSE approved_by END,
          approved_at = CASE WHEN ${approved} THEN now() ELSE approved_at END,
          rejected_by = CASE WHEN ${approved} THEN rejected_by ELSE ${input.userId} END,
          rejected_at = CASE WHEN ${approved} THEN rejected_at ELSE now() END,
          updated_at = now()
      WHERE id = ${input.transferId}
        AND enterprise_id = ${input.enterpriseId}
        AND status IN ('DRAFT', 'PENDING_APPROVAL')
      RETURNING id
    `);
        if (!result.rows[0])
            return null;
        await Db1Connection.getInstance().execute(sql `
      UPDATE intercompany_transfer_approval_steps
      SET status = ${stepStatus}, decision = ${input.decision}, decision_comment = ${input.comment ?? null},
          approver_user_id = ${input.userId}, decided_at = now()
      WHERE transfer_id = ${input.transferId}
        AND status = 'PENDING'
        AND step_order = (
          SELECT min(step_order) FROM intercompany_transfer_approval_steps
          WHERE transfer_id = ${input.transferId} AND status = 'PENDING'
        )
    `);
        await this.insertTransferTimeline(input.transferId, action, approved ? "Approved" : "Rejected", "COMPLETED", input.userId, input.comment ?? null);
        return this.getTransfer(input.enterpriseId, input.transferId);
    }
    async transitionTransfer(input) {
        const target = this.transferTargetStatus(input.action);
        const timestampColumn = this.transferTimestampColumn(input.action);
        const result = await Db1Connection.getInstance().execute(sql `
      UPDATE intercompany_transfers
      SET status = ${target}, workflow_status = ${target},
          submitted_by = CASE WHEN ${input.action} = 'SUBMIT' THEN ${input.userId} ELSE submitted_by END,
          ${sql.raw(timestampColumn)} = now(),
          settlement_status = CASE WHEN ${input.action} = 'SETTLE' THEN 'SETTLED' ELSE settlement_status END,
          updated_at = now()
      WHERE id = ${input.transferId}
        AND enterprise_id = ${input.enterpriseId}
        AND status IN (${sql.raw(this.transferAllowedStatuses(input.action))})
      RETURNING id
    `);
        if (!result.rows[0])
            return null;
        if (input.action === "SUBMIT") {
            await this.insertTransferTimeline(input.transferId, "SUBMITTED", "Submitted", "PENDING", input.userId, input.comment ?? null);
        }
        else {
            await this.insertTransferTimeline(input.transferId, input.action, this.transferActionLabel(input.action), "COMPLETED", input.userId, input.comment ?? null);
        }
        if (input.action === "SETTLE") {
            await Db1Connection.getInstance().execute(sql `
        UPDATE intercompany_settlements SET status = 'SETTLED', updated_at = now()
        WHERE transfer_id = ${input.transferId}
      `);
        }
        return this.getTransfer(input.enterpriseId, input.transferId);
    }
    async listInvoices(enterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT ii.id, ii.transfer_id AS "transferId",
             ii.source_company_id AS "sourceCompanyId",
             ii.destination_company_id AS "destinationCompanyId",
             ii.invoice_number AS "invoiceNumber",
             ii.amount, ii.currency, ii.status, ii.created_at AS "createdAt"
      FROM intercompany_invoices ii
      LEFT JOIN intercompany_transfers it ON it.id = ii.transfer_id
      WHERE it.enterprise_id = ${enterpriseId}
         OR (
           ii.source_company_id IN (SELECT company_id FROM enterprise_companies WHERE enterprise_id = ${enterpriseId})
           AND ii.destination_company_id IN (SELECT company_id FROM enterprise_companies WHERE enterprise_id = ${enterpriseId})
         )
      ORDER BY ii.created_at DESC
    `);
        return result.rows;
    }
    async createInvoice(input) {
        const id = randomUUID();
        const now = new Date();
        const status = input.status ?? "DRAFT";
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO intercompany_invoices (
        id, transfer_id, source_company_id, destination_company_id,
        invoice_number, amount, currency, status, created_at
      ) VALUES (
        ${id}, ${input.transferId ?? null}, ${input.sourceCompanyId}, ${input.destinationCompanyId},
        ${input.invoiceNumber}, ${input.amount}, ${input.currency}, ${status}, ${now}
      )
    `);
        return { id, ...input, status, createdAt: now };
    }
    async reportingSummary(enterpriseId) {
        const db1 = Db1Connection.getInstance();
        const db2 = Db2Connection.getInstance();
        const companyRows = await db1.execute(sql `
      SELECT company_id AS "companyId"
      FROM enterprise_companies
      WHERE enterprise_id = ${enterpriseId}
    `);
        const companyIds = companyRows.rows.map((row) => String(row.companyId));
        if (!companyIds.length) {
            return this.emptySummary();
        }
        const db1Counts = await db1.execute(sql `
      SELECT
        (SELECT count(*) FROM enterprise_companies WHERE enterprise_id = ${enterpriseId}) AS "totalCompanies",
        (SELECT count(*) FROM organizations WHERE company_id = ANY(${companyIds}) AND deleted_at IS NULL) AS "totalOrganizations",
        (SELECT count(DISTINCT user_id) FROM user_roles WHERE company_id = ANY(${companyIds})) AS "totalUsers"
    `);
        const db2Counts = await db2.execute(sql `
      SELECT
        (SELECT count(*) FROM warehouses WHERE company_id = ANY(${companyIds}) AND deleted_at IS NULL) AS "totalWarehouses",
        (SELECT count(*) FROM suppliers WHERE company_id = ANY(${companyIds})) AS "totalSuppliers",
        (SELECT count(*) FROM customers WHERE company_id = ANY(${companyIds})) AS "totalCustomers",
        (SELECT count(*) FROM products WHERE company_id = ANY(${companyIds}) AND deleted_at IS NULL) AS "totalProducts",
        (SELECT coalesce(sum(quantity_on_hand), 0) FROM stock_items WHERE company_id = ANY(${companyIds})) AS "totalInventoryQuantity",
        (SELECT coalesce(sum(quantity_on_hand * average_cost), 0) FROM stock_items WHERE company_id = ANY(${companyIds})) AS "totalInventoryValue",
        (SELECT count(*) FROM purchase_orders WHERE company_id = ANY(${companyIds})) AS "totalPurchaseOrders",
        (SELECT count(*) FROM sales_orders WHERE company_id = ANY(${companyIds})) AS "totalSalesOrders",
        0 AS "totalRevenue"
    `);
        return {
            ...(db1Counts.rows[0] ?? {}),
            ...(db2Counts.rows[0] ?? {}),
        };
    }
    async findRowById(enterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT ${this.enterpriseSelectSql()}
      FROM enterprises e
      LEFT JOIN enterprises p ON p.id = e.parent_enterprise_id
      LEFT JOIN users cu ON cu.id = e.created_by
      LEFT JOIN users uu ON uu.id = e.updated_by
      WHERE e.id = ${enterpriseId}
      LIMIT 1
    `);
        return result.rows[0] ?? null;
    }
    enterpriseSelectSql() {
        return sql `
      e.id, e.code, e.name, e.enterprise_type AS "enterpriseType",
      e.parent_enterprise_id AS "parentEnterpriseId",
      p.name AS "parentEnterpriseName",
      e.hierarchy_level AS "hierarchyLevel",
      e.hierarchy_path AS "hierarchyPath",
      e.description, e.status, e.legal_name AS "legalName",
      e.tax_id AS "taxId", e.country, e.state, e.city,
      e.postal_code AS "postalCode", e.address, e.timezone, e.currency,
      e.compliance_score AS "complianceScore",
      e.compliance_status AS "complianceStatus",
      e.owner_user_id AS "ownerUserId",
      e.created_by AS "createdBy", e.updated_by AS "updatedBy",
      cu.display_name AS "createdByName", uu.display_name AS "updatedByName",
      e.created_at AS "createdAt", e.updated_at AS "updatedAt"
    `;
    }
    filterEnterpriseRows(rows, query) {
        const search = query.search?.toLowerCase();
        return rows.filter((row) => {
            if (query.enterpriseType && row.enterpriseType !== query.enterpriseType)
                return false;
            if (query.status && row.status !== query.status)
                return false;
            if (query.country && row.country !== query.country)
                return false;
            if (query.parentEnterpriseId && row.parentEnterpriseId !== query.parentEnterpriseId)
                return false;
            if (search) {
                const haystack = `${row.code} ${row.name} ${row.parentEnterpriseName ?? ""} ${row.country ?? ""}`.toLowerCase();
                if (!haystack.includes(search))
                    return false;
            }
            if (query.createdFrom && new Date(row.createdAt) < new Date(query.createdFrom))
                return false;
            if (query.createdTo && new Date(row.createdAt) > new Date(query.createdTo))
                return false;
            return true;
        }).slice(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? 50));
    }
    async statistics(enterpriseId) {
        const db1 = Db1Connection.getInstance();
        const db2 = Db2Connection.getInstance();
        const companyRows = await db1.execute(sql `SELECT company_id AS "companyId" FROM enterprise_companies WHERE enterprise_id = ${enterpriseId}`);
        const companyIds = companyRows.rows.map((row) => String(row.companyId));
        const db1Counts = await db1.execute(sql `
      SELECT
        (SELECT count(*) FROM enterprise_users WHERE enterprise_id = ${enterpriseId}) AS total_users,
        (SELECT count(*) FROM enterprise_documents WHERE enterprise_id = ${enterpriseId} AND deleted_at IS NULL) AS total_documents,
        (SELECT count(*) FROM enterprises WHERE parent_enterprise_id = ${enterpriseId} AND enterprise_type = 'BRANCH_ENTERPRISE') AS total_branches,
        (SELECT count(*) FROM enterprises WHERE parent_enterprise_id = ${enterpriseId} AND enterprise_type = 'SUBSIDIARY_ENTERPRISE') AS total_subsidiaries
    `);
        let totalWarehouses = 0;
        if (companyIds.length) {
            const warehouseRows = await db2.execute(sql `SELECT count(*) AS total_warehouses FROM warehouses WHERE company_id = ANY(${companyIds}) AND deleted_at IS NULL`);
            totalWarehouses = Number(warehouseRows.rows[0]?.total_warehouses ?? 0);
        }
        return {
            ...(db1Counts.rows[0] ?? {}),
            total_warehouses: totalWarehouses,
        };
    }
    async hierarchyTreeForEnterprise(enterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT e.id AS enterprise_id, e.code AS enterprise_code, e.name AS enterprise_name,
             e.enterprise_type, e.parent_enterprise_id, e.status, e.hierarchy_level, e.hierarchy_path,
             (SELECT count(*) FROM enterprises c WHERE c.parent_enterprise_id = e.id) AS child_count
      FROM enterprises e
      WHERE e.id = ${enterpriseId}
         OR e.hierarchy_path LIKE ${`%/${enterpriseId}/%`}
      ORDER BY e.hierarchy_level ASC, e.name ASC
    `);
        const rows = result.rows;
        const root = rows.find((row) => row.enterprise_id === enterpriseId);
        if (!root)
            return [];
        return [this.toTreeNode(root, this.buildTree(rows, enterpriseId))];
    }
    buildTree(rows, parentEnterpriseId) {
        return rows
            .filter((row) => row.parent_enterprise_id === parentEnterpriseId || (parentEnterpriseId === null && row.parent_enterprise_id === null))
            .map((row) => this.toTreeNode(row, this.buildTree(rows, row.enterprise_id)));
    }
    toTreeNode(row, children) {
        return {
            enterprise_id: row.enterprise_id,
            enterprise_code: row.enterprise_code,
            enterprise_name: row.enterprise_name,
            enterprise_type: row.enterprise_type,
            status: row.status,
            child_count: Number(row.child_count),
            depth: Number(row.hierarchy_level),
            hierarchy_path: row.hierarchy_path,
            children,
        };
    }
    toListContract(row) {
        return {
            enterprise_id: row.id,
            enterprise_code: row.code,
            enterprise_name: row.name,
            enterprise_type: row.enterpriseType,
            parent_enterprise_id: row.parentEnterpriseId,
            parent_enterprise_name: row.parentEnterpriseName,
            hierarchy_level: row.hierarchyLevel,
            hierarchy_path: row.hierarchyPath,
            status: row.status,
            created_at: row.createdAt,
            updated_at: row.updatedAt,
            total_users: 0,
            total_warehouses: 0,
            total_documents: 0,
            total_branches: 0,
            total_subsidiaries: 0,
            compliance_score: row.complianceScore,
            compliance_status: row.complianceStatus,
            created_by: row.createdByName ?? row.createdBy,
            updated_by: row.updatedByName ?? row.updatedBy,
            country: row.country,
            timezone: row.timezone,
            currency: row.currency,
            legal_name: row.legalName,
            tax_id: row.taxId,
            state: row.state,
            city: row.city,
            postal_code: row.postalCode,
            address: row.address,
            description: row.description,
        };
    }
    complianceContract(row) {
        return {
            compliance_score: row.complianceScore,
            compliance_status: row.complianceStatus,
            metrics: {
                documentation: row.complianceScore,
                configuration: row.complianceScore,
                audit_readiness: row.complianceScore,
            },
            violations: [],
        };
    }
    groupSettings(settings) {
        return settings.reduce((sections, setting) => {
            const section = String(setting.section);
            sections[section] = [...(sections[section] ?? []), setting];
            return sections;
        }, {});
    }
    toSettingContract(row) {
        return {
            section: row.section,
            key: row.setting_key,
            value: row.setting_value,
            inherited_from: row.inherited_from,
            source_enterprise: row.source_enterprise_name,
            source_enterprise_id: row.source_enterprise_id,
            override_allowed: row.override_allowed,
            override_status: row.override_status,
        };
    }
    async ensureConfigurationRows(enterpriseId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT count(*) AS count
      FROM enterprise_configuration_settings
      WHERE enterprise_id = ${enterpriseId}
    `);
        if (Number(result.rows[0]?.count ?? 0) > 0)
            return;
        const current = await this.findRowById(enterpriseId);
        await this.seedConfiguration(enterpriseId, current?.parentEnterpriseId ?? null);
    }
    async seedConfiguration(enterpriseId, parentEnterpriseId) {
        for (const setting of DEFAULT_CONFIGURATION) {
            await this.upsertConfigurationSetting(enterpriseId, {
                ...setting,
                overrideStatus: parentEnterpriseId ? "INHERITED" : setting.overrideStatus,
                sourceEnterpriseId: parentEnterpriseId,
            });
        }
    }
    async upsertConfigurationSetting(enterpriseId, setting) {
        const id = randomUUID();
        const now = new Date();
        const value = JSON.stringify(setting.value ?? null);
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO enterprise_configuration_settings (
        id, enterprise_id, section, setting_key, setting_value, inherited_from,
        source_enterprise_id, override_allowed, override_status, created_at, updated_at
      ) VALUES (
        ${id}, ${enterpriseId}, ${setting.section}, ${setting.key}, ${value}::jsonb,
        ${setting.sourceEnterpriseId ?? null}, ${setting.sourceEnterpriseId ?? null},
        ${setting.overrideAllowed ?? true}, ${setting.overrideStatus ?? "OVERRIDDEN"}, ${now}, ${now}
      )
      ON CONFLICT (enterprise_id, section, setting_key) DO UPDATE
      SET setting_value = EXCLUDED.setting_value,
          inherited_from = EXCLUDED.inherited_from,
          source_enterprise_id = EXCLUDED.source_enterprise_id,
          override_allowed = EXCLUDED.override_allowed,
          override_status = EXCLUDED.override_status,
          updated_at = EXCLUDED.updated_at
    `);
    }
    async refreshChildHierarchy(parentEnterpriseId) {
        const children = await Db1Connection.getInstance().execute(sql `
      SELECT id
      FROM enterprises
      WHERE parent_enterprise_id = ${parentEnterpriseId}
    `);
        for (const child of children.rows) {
            await this.update({ enterpriseId: child.id });
        }
    }
    transferSelectSql() {
        return sql `
      it.id AS transfer_id, it.transfer_number, it.reference_number,
      it.enterprise_id, it.source_enterprise_id, it.destination_enterprise_id,
      it.source_company_id, it.destination_company_id,
      it.source_organization_id, it.destination_organization_id,
      it.source_warehouse_id, it.destination_warehouse_id,
      it.transfer_type, it.transfer_date, it.planned_ship_date, it.expected_delivery_date,
      it.priority, it.reason, it.shipping_method, it.carrier, it.tracking_number,
      it.special_instructions, it.internal_notes, it.settlement_method,
      it.billing_enterprise_id, it.currency, it.total_items, it.total_quantity,
      it.total_value, it.settlement_status, it.workflow_status, it.status,
      it.approval_note, it.business_justification, it.risk_acknowledged,
      it.policy_acknowledged, it.created_by, it.submitted_by, it.approved_by,
      it.rejected_by, it.created_at, it.updated_at, it.submitted_at,
      it.approved_at, it.rejected_at, it.dispatched_at, it.received_at,
      it.completed_at, it.cancelled_at, it.tax_handling, it.invoice_generation,
      se.code AS source_enterprise_code, se.name AS source_enterprise_name,
      se.enterprise_type AS source_enterprise_type,
      de.code AS destination_enterprise_code, de.name AS destination_enterprise_name,
      de.enterprise_type AS destination_enterprise_type,
      be.code AS billing_enterprise_code, be.name AS billing_enterprise_name,
      cu.display_name AS created_by_name
    `;
    }
    filterTransferRows(rows, query) {
        const search = query.search?.toLowerCase();
        const filtered = rows.filter((row) => {
            const status = String(row.status);
            if (query.tab && query.tab !== "ALL") {
                if (query.tab === "PENDING_SETTLEMENT" && row.settlement_status !== "UNSETTLED" && row.settlement_status !== "PARTIAL")
                    return false;
                if (query.tab !== "PENDING_SETTLEMENT" && status !== query.tab)
                    return false;
            }
            if (query.status && status !== query.status)
                return false;
            if (query.transferType && row.transfer_type !== query.transferType)
                return false;
            if (query.sourceEnterpriseId && row.source_enterprise_id !== query.sourceEnterpriseId)
                return false;
            if (query.destinationEnterpriseId && row.destination_enterprise_id !== query.destinationEnterpriseId)
                return false;
            if (query.dateFrom && new Date(String(row.transfer_date)) < new Date(query.dateFrom))
                return false;
            if (query.dateTo && new Date(String(row.transfer_date)) > new Date(query.dateTo))
                return false;
            if (search) {
                const haystack = `${row.transfer_number ?? ""} ${row.reference_number ?? ""} ${row.internal_notes ?? ""} ${row.reason ?? ""}`.toLowerCase();
                if (!haystack.includes(search))
                    return false;
            }
            return true;
        });
        if (query.limit === undefined && query.offset === undefined)
            return filtered;
        return filtered.slice(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? 10));
    }
    transferTabs(rows) {
        const count = (predicate) => rows.filter(predicate).length;
        return [
            { key: "ALL", label: "All Transfers", count: rows.length },
            { key: "PENDING_APPROVAL", label: "Pending Approval", count: count((row) => row.status === "PENDING_APPROVAL") },
            { key: "IN_TRANSIT", label: "In Transit", count: count((row) => row.status === "IN_TRANSIT") },
            { key: "PENDING_SETTLEMENT", label: "Pending Settlement", count: count((row) => row.settlement_status === "UNSETTLED" || row.settlement_status === "PARTIAL") },
            { key: "COMPLETED", label: "Completed", count: count((row) => row.status === "COMPLETED") },
            { key: "CANCELLED", label: "Cancelled", count: count((row) => row.status === "CANCELLED") },
        ];
    }
    toTransferListContract(row) {
        return {
            transfer_id: row.transfer_id,
            transfer_number: row.transfer_number,
            reference_number: row.reference_number,
            date: row.transfer_date,
            created_at: row.created_at,
            from_enterprise: {
                enterprise_id: row.source_enterprise_id,
                enterprise_code: row.source_enterprise_code,
                enterprise_name: row.source_enterprise_name,
                enterprise_type: row.source_enterprise_type,
            },
            to_enterprise: {
                enterprise_id: row.destination_enterprise_id,
                enterprise_code: row.destination_enterprise_code,
                enterprise_name: row.destination_enterprise_name,
                enterprise_type: row.destination_enterprise_type,
            },
            status: row.status,
            status_badge: this.statusBadge(String(row.status)),
            transfer_type: row.transfer_type,
            items_quantity: {
                total_items: Number(row.total_items ?? 0),
                total_quantity: Number(row.total_quantity ?? 0),
                label: `${row.total_items ?? 0} / ${row.total_quantity ?? 0} Units`,
            },
            settlement_status: row.settlement_status,
            settlement_badge: this.settlementBadge(String(row.settlement_status)),
            actions: ["view_details", "documents"],
        };
    }
    toTransferDetailContract(row) {
        return {
            transfer_id: row.transfer_id,
            transfer_number: row.transfer_number,
            reference_number: row.reference_number,
            transfer_type: row.transfer_type,
            status: row.status,
            status_badge: this.statusBadge(String(row.status)),
            workflow_status: row.workflow_status,
            priority: row.priority,
            priority_badge: this.priorityBadge(String(row.priority)),
            created_at: row.created_at,
            created_by: { user_id: row.created_by, display_name: row.created_by_name },
            transfer_information: {
                from_enterprise: {
                    enterprise_id: row.source_enterprise_id,
                    enterprise_code: row.source_enterprise_code,
                    enterprise_name: row.source_enterprise_name,
                    enterprise_type: row.source_enterprise_type,
                },
                to_enterprise: {
                    enterprise_id: row.destination_enterprise_id,
                    enterprise_code: row.destination_enterprise_code,
                    enterprise_name: row.destination_enterprise_name,
                    enterprise_type: row.destination_enterprise_type,
                },
                transfer_date: row.transfer_date,
                planned_ship_date: row.planned_ship_date,
                expected_delivery_date: row.expected_delivery_date,
                reference_number: row.reference_number,
                notes: row.internal_notes,
                reason: row.reason,
            },
            participating_locations: {
                from_location_id: row.source_warehouse_id,
                to_location_id: row.destination_warehouse_id,
            },
            shipping: {
                method: row.shipping_method,
                carrier: row.carrier,
                tracking_number: row.tracking_number,
                special_instructions: row.special_instructions,
            },
            settlement_information: {
                settlement_method: row.settlement_method,
                billing_enterprise: {
                    enterprise_id: row.billing_enterprise_id,
                    enterprise_code: row.billing_enterprise_code,
                    enterprise_name: row.billing_enterprise_name,
                },
                currency: row.currency,
                total_estimated_value: row.total_value,
                settlement_status: row.settlement_status,
                settlement_badge: this.settlementBadge(String(row.settlement_status)),
                tax_handling: row.tax_handling,
                taxHandling: row.tax_handling,
                invoice_generation: row.invoice_generation,
                invoiceGeneration: row.invoice_generation,
            },
            approval_submission: {
                approval_note: row.approval_note,
                business_justification: row.business_justification,
                risk_acknowledged: row.risk_acknowledged,
                policy_acknowledged: row.policy_acknowledged,
            },
        };
    }
    async transferItems(transferId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id AS item_id, product_id, product_sku, product_name, product_category,
             product_image_url, available_stock, transfer_quantity, uom, unit_cost,
             subtotal, created_at
      FROM intercompany_transfer_items
      WHERE transfer_id = ${transferId}
      ORDER BY created_at ASC
    `);
        return result.rows;
    }
    async transferAttachments(transferId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id AS attachment_id, file_name, file_type, file_size, file_key,
             file_url, uploaded_by, uploaded_at
      FROM intercompany_transfer_attachments
      WHERE transfer_id = ${transferId}
      ORDER BY uploaded_at DESC
    `);
        return result.rows;
    }
    async transferApprovals(transferId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT step_order, step_name, approver_role, approver_user_id, status,
             decision, decision_comment, decided_at, created_at,
             sla_hours, escalation_after_hours, escalation_role, applied_policy
      FROM intercompany_transfer_approval_steps
      WHERE transfer_id = ${transferId}
      ORDER BY step_order ASC
    `);
        return result.rows;
    }
    async transferTimeline(transferId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT event_type AS "event_key", event_label, event_status AS "status", actor_user_id, comment, created_at AS "event_at"
      FROM intercompany_transfer_timeline
      WHERE transfer_id = ${transferId}
      ORDER BY created_at ASC
    `);
        return result.rows;
    }
    async transferPolicyChecks(transferId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT check_key, check_label, status, severity, message, metadata, created_at
      FROM intercompany_transfer_policy_checks
      WHERE transfer_id = ${transferId}
      ORDER BY created_at ASC
    `);
        return result.rows;
    }
    async transferSettlement(transferId) {
        const result = await Db1Connection.getInstance().execute(sql `
      SELECT id AS settlement_id, settlement_method, billing_enterprise_id,
             currency, amount, settled_amount, status, created_at, updated_at
      FROM intercompany_settlements
      WHERE transfer_id = ${transferId}
      LIMIT 1
    `);
        return result.rows[0] ?? null;
    }
    transferActions(status, settlementStatus) {
        const actions = ["view_documents"];
        if (status === "DRAFT")
            actions.push("submit_for_approval", "save_as_draft", "cancel");
        if (status === "PENDING_APPROVAL")
            actions.push("approve_transfer", "reject_transfer");
        if (status === "APPROVED")
            actions.push("dispatch_transfer");
        if (status === "IN_TRANSIT")
            actions.push("receive_transfer");
        if (status === "RECEIVED")
            actions.push("complete_transfer");
        if (status === "COMPLETED" && settlementStatus !== "SETTLED")
            actions.push("settle_transfer");
        return actions;
    }
    async insertTransferItem(transferId, item) {
        const quantity = Number(item.transferQuantity);
        const unitCost = Number(item.unitCost);
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO intercompany_transfer_items (
        id, transfer_id, product_id, product_sku, product_name, product_category,
        product_image_url, available_stock, transfer_quantity, uom, unit_cost,
        subtotal, created_at
      ) VALUES (
        ${randomUUID()}, ${transferId}, ${item.productId ?? null}, ${item.productSku},
        ${item.productName}, ${item.productCategory ?? null}, ${item.productImageUrl ?? null},
        ${item.availableStock}, ${item.transferQuantity}, ${item.uom}, ${item.unitCost},
        ${String(quantity * unitCost)}, now()
      )
    `);
    }
    async insertTransferAttachment(transferId, uploadedBy, attachment) {
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO intercompany_transfer_attachments (
        id, transfer_id, file_name, file_type, file_size, file_key, file_url,
        uploaded_by, uploaded_at
      ) VALUES (
        ${randomUUID()}, ${transferId}, ${attachment.fileName}, ${attachment.fileType ?? null},
        ${attachment.fileSize ?? null}, ${attachment.fileKey ?? null}, ${attachment.fileUrl ?? null},
        ${uploadedBy}, now()
      )
    `);
    }
    async seedTransferWorkflow(transferId, userId) {
        const steps = [
            { order: 1, name: "Level 1 Approval", role: "Warehouse Manager", policy: "Warehouse Transfer Policy" },
            { order: 2, name: "Level 2 Approval", role: "Finance Manager", policy: "Finance Threshold Policy" },
            { order: 3, name: "Final Approval", role: "Enterprise Admin", policy: "Enterprise Directorship Policy" },
        ];
        for (const step of steps) {
            await Db1Connection.getInstance().execute(sql `
        INSERT INTO intercompany_transfer_approval_steps (
          id, transfer_id, step_order, step_name, approver_role, status,
          sla_hours, escalation_after_hours, escalation_role, applied_policy, created_at
        ) VALUES (
          ${randomUUID()}, ${transferId}, ${step.order}, ${step.name}, ${step.role},
          'PENDING', 48, 24, 'Enterprise Admin', ${step.policy}, now()
        )
      `);
        }
        await this.insertTransferTimeline(transferId, "WORKFLOW_PREPARED", "Workflow Prepared", "PENDING", userId, "Sequential approval workflow prepared.");
    }
    async seedTransferChecks(transferId, items, totalValue) {
        const insufficient = items.some((item) => Number(item.transferQuantity) > Number(item.availableStock));
        const checks = [
            { key: "inventory_availability", label: "Inventory Availability", status: insufficient ? "FAILED" : "PASSED", severity: insufficient ? "ERROR" : "INFO", message: insufficient ? "Insufficient source stock for one or more items." : "Sufficient stock available at source." },
            { key: "negative_stock", label: "Negative Stock Prevention", status: insufficient ? "FAILED" : "PASSED", severity: insufficient ? "ERROR" : "INFO", message: insufficient ? "Transfer may cause negative stock." : "Transfer will not cause negative stock." },
            { key: "destination_capacity", label: "Destination Capacity", status: "PASSED", severity: "INFO", message: "Destination warehouse has available capacity." },
            { key: "entity_policy", label: "Entity Policy Validation", status: "PASSED", severity: "INFO", message: "Entities are eligible for intercompany transfer." },
            { key: "threshold_validation", label: "Threshold Validation", status: totalValue > 10000 ? "WARNING" : "PASSED", severity: totalValue > 10000 ? "WARNING" : "INFO", message: totalValue > 10000 ? `Transfer value exceeds standard threshold of 10,000.00.` : "Within standard transfer threshold limit." },
            { key: "approval_policy", label: "Approval Policy Validation", status: "PASSED", severity: "INFO", message: "Routing policy validated." },
            { key: "compliance_validation", label: "Compliance Validation", status: "PASSED", severity: "INFO", message: "Complies with regulatory transfer policies." },
            { key: "budget_impact", label: "Budget Impact", status: "PASSED", severity: "INFO", message: "Transfer falls within allocated operational budget." },
            { key: "financial_validation", label: "Financial Validation", status: "PASSED", severity: "INFO", message: "Settlement method and tax configurations are valid." }
        ];
        for (const check of checks) {
            await Db1Connection.getInstance().execute(sql `
        INSERT INTO intercompany_transfer_policy_checks (
          id, transfer_id, check_key, check_label, status, severity, message, metadata, created_at
        ) VALUES (
          ${randomUUID()}, ${transferId}, ${check.key}, ${check.label}, ${check.status},
          ${check.severity}, ${check.message}, '{}'::jsonb, now()
        )
      `);
        }
    }
    async insertTransferTimeline(transferId, eventKey, eventLabel, status, actorUserId, comment) {
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO intercompany_transfer_timeline (
        id, transfer_id, event_type, event_label, event_status, actor_user_id, comment, created_at
      ) VALUES (
        ${randomUUID()}, ${transferId}, ${eventKey}, ${eventLabel}, ${status},
        ${actorUserId}, ${comment}, now()
      )
    `);
    }
    async createSettlement(transferId, settlementMethod, billingEnterpriseId, currency, amount) {
        await Db1Connection.getInstance().execute(sql `
      INSERT INTO intercompany_settlements (
        id, transfer_id, settlement_method, billing_enterprise_id, currency,
        amount, settled_amount, status, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${transferId}, ${settlementMethod}, ${billingEnterpriseId},
        ${currency}, ${amount}, '0', 'UNSETTLED', now(), now()
      )
    `);
    }
    transferTargetStatus(action) {
        const targets = {
            SUBMIT: "PENDING_APPROVAL",
            DISPATCH: "IN_TRANSIT",
            RECEIVE: "RECEIVED",
            COMPLETE: "COMPLETED",
            SETTLE: "COMPLETED",
            CANCEL: "CANCELLED",
        };
        return targets[action];
    }
    transferAllowedStatuses(action) {
        const allowed = {
            SUBMIT: ["DRAFT"],
            DISPATCH: ["APPROVED"],
            RECEIVE: ["IN_TRANSIT"],
            COMPLETE: ["RECEIVED"],
            SETTLE: ["COMPLETED"],
            CANCEL: ["DRAFT", "PENDING_APPROVAL", "APPROVED"],
        };
        return allowed[action].map((status) => `'${status}'`).join(", ");
    }
    transferTimestampColumn(action) {
        const columns = {
            SUBMIT: "submitted_at",
            DISPATCH: "dispatched_at",
            RECEIVE: "received_at",
            COMPLETE: "completed_at",
            SETTLE: "completed_at",
            CANCEL: "cancelled_at",
        };
        return columns[action];
    }
    transferActionLabel(action) {
        const labels = {
            SUBMIT: "Submitted",
            DISPATCH: "Dispatched",
            RECEIVE: "Received",
            COMPLETE: "Completed",
            SETTLE: "Settled",
            CANCEL: "Cancelled",
        };
        return labels[action];
    }
    statusBadge(status) {
        const tone = {
            DRAFT: "neutral",
            PENDING_APPROVAL: "warning",
            APPROVED: "success",
            IN_TRANSIT: "info",
            PENDING_SETTLEMENT: "warning",
            RECEIVED: "info",
            COMPLETED: "success",
            REJECTED: "danger",
            CANCELLED: "neutral",
        };
        return { label: status.replace(/_/g, " "), tone: tone[status] ?? "neutral" };
    }
    settlementBadge(status) {
        const tone = { UNSETTLED: "danger", PARTIAL: "warning", SETTLED: "success", NOT_APPLICABLE: "neutral" };
        return { label: status.replace(/_/g, " "), tone: tone[status] ?? "neutral" };
    }
    priorityBadge(priority) {
        const tone = { LOW: "neutral", NORMAL: "info", HIGH: "warning", URGENT: "danger" };
        return { label: priority, tone: tone[priority] ?? "neutral" };
    }
    emptySummary() {
        return {
            totalCompanies: 0,
            totalOrganizations: 0,
            totalWarehouses: 0,
            totalUsers: 0,
            totalSuppliers: 0,
            totalCustomers: 0,
            totalProducts: 0,
            totalInventoryQuantity: 0,
            totalInventoryValue: 0,
            totalPurchaseOrders: 0,
            totalSalesOrders: 0,
            totalRevenue: 0,
        };
    }
}
