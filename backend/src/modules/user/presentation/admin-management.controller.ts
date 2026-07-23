import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { eq, ilike, desc, and, sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { usersTable, farmersTable, statesTable, districtsTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
import { ApiResponse } from "../../../shared/http/api-response";
import { PassService } from "../../auth/services/pass.service";

/** Lightweight admin management controller — no CompanyGuard required */
export class AdminManagementController {
  private readonly passService = new PassService();

  private get db() {
    return Db1Connection.getInstance();
  }

  /** GET /api/v1/admin/list - List all admin/super-admin users */
  public list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, status, page = "1", limit = "20" } = req.query;
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const offset = (pageNum - 1) * limitNum;

      const conditions: any[] = [
        eq(usersTable.userType, "admin"),
      ];

      if (search) {
        conditions.push(ilike(usersTable.email, `%${search}%`));
      }
      if (status && status !== "all") {
        conditions.push(eq(usersTable.status, String(status)));
      }

      const admins = await this.db
        .select({
          id: usersTable.id,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          displayName: usersTable.displayName,
          email: usersTable.email,
          status: usersTable.status,
          userType: usersTable.userType,
          createdAt: usersTable.createdAt,
          lastLoginAt: usersTable.lastLoginAt,
        })
        .from(usersTable)
        .where(and(...conditions))
        .orderBy(desc(usersTable.createdAt))
        .limit(limitNum)
        .offset(offset);

      ApiResponse.ok(res, { admins, total: admins.length, page: pageNum, limit: limitNum }, "Admins loaded");
    } catch (e: any) {
      console.error("AdminManagement.list error:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  };

  /** GET /api/v1/admin/farmers - List all registered farmers */
  public listFarmers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, status, page = "1", limit = "20" } = req.query;
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const offset = (pageNum - 1) * limitNum;

      let query = this.db
        .select({
          id: farmersTable.id,
          firstName: farmersTable.firstName,
          lastName: farmersTable.lastName,
          phone: farmersTable.phone,
          profileStatus: farmersTable.profileStatus,
          village: farmersTable.village,
          stateName: statesTable.name,
          districtName: districtsTable.name,
          createdAt: farmersTable.createdAt,
        })
        .from(farmersTable)
        .leftJoin(statesTable, eq(farmersTable.stateId, statesTable.id))
        .leftJoin(districtsTable, eq(farmersTable.districtId, districtsTable.id));

      if (search) {
        query = query.where(
          sql`(${farmersTable.firstName} ILIKE ${'%' + search + '%'} OR ${farmersTable.phone} ILIKE ${'%' + search + '%'})`
        ) as any;
      }

      const farmers = await query
        .orderBy(desc(farmersTable.createdAt))
        .limit(limitNum)
        .offset(offset);

      ApiResponse.ok(res, { farmers, total: farmers.length, page: pageNum, limit: limitNum }, "Farmers loaded");
    } catch (e: any) {
      console.error("AdminManagement.listFarmers error:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  };

  /** POST /api/v1/admin/create - Create a new admin user */
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { firstName, lastName, email, phone, permissions } = req.body;
      if (!email) {
        ApiResponse.badRequest(res, "email is required");
        return;
      }
      if (!firstName) {
        ApiResponse.badRequest(res, "firstName is required");
        return;
      }

      // Check if user already exists
      const existing = await this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase().trim()))
        .limit(1);

      if (existing.length > 0) {
        res.status(409).json({ success: false, message: "A user with this email already exists" });
        return;
      }

      const id = randomUUID();
      const now = new Date();
      const displayName = `${firstName.trim()} ${(lastName || "").trim()}`.trim();

      let passwordHash: string | null = null;
      let passwordSalt: string | null = null;
      
      if (req.body.password) {
        const hashed = await this.passService.hash(req.body.password);
        passwordHash = hashed.hash;
        passwordSalt = hashed.salt;
      }

      await this.db.insert(usersTable).values({
        id,
        firstName: firstName.trim(),
        lastName: lastName?.trim() ?? null,
        displayName,
        email: email.toLowerCase().trim(),
        phone: phone?.trim() ?? null,
        passwordHash,
        passwordSalt,
        userType: "admin",
        status: "active",
        isEmailVerified: true, // Auto-verify for superadmin created users
        isPhoneVerified: false,
        isMfaEnabled: false,
        isSsoUser: false,
        failedLoginAttempts: 0,
        createdAt: now,
        updatedAt: now,
      });

      const admin = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);

      ApiResponse.created(res, admin[0], "Admin created successfully");
    } catch (e: any) {
      console.error("AdminManagement.create error:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  };

  /** PATCH /api/v1/admin/:id - Update admin (status / name) */
  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { firstName, lastName, status, phone } = req.body;

      const updateData: any = { updatedAt: new Date() };

      if (firstName !== undefined) {
        updateData.firstName = firstName.trim();
        updateData.displayName = `${firstName.trim()} ${(lastName ?? '').trim()}`.trim();
      }
      if (lastName !== undefined) {
        updateData.lastName = lastName.trim();
      }
      if (status !== undefined) {
        updateData.status = String(status).toLowerCase() === 'active' ? 'active' : 'suspended';
      }
      if (phone !== undefined) {
        updateData.phone = phone;
      }

      await this.db.update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, id));

      const adminResult = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
      if (!adminResult[0]) { ApiResponse.notFound(res, "Admin not found"); return; }

      ApiResponse.ok(res, adminResult[0], "Admin updated");
    } catch (e: any) {
      console.error("AdminManagement.update error:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  };

  /** DELETE /api/v1/admin/:id - Deactivate (soft-delete) admin */
  public deactivate = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.db.update(usersTable)
        .set({ status: 'suspended', updatedAt: new Date() })
        .where(eq(usersTable.id, id));
      ApiResponse.ok(res, { id }, "Admin deactivated");
    } catch (e: any) {
      console.error("AdminManagement.deactivate error:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  };
}

