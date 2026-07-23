import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/Projects/flutter_projects/ROYAL/RSBC/rsbc/backend/.env') });

const pool1 = new pg.Pool({
  host: process.env._DB_HOST_ONE || process.env.DB_HOST_ONE,
  port: parseInt(process.env._DB_PORT_ONE || process.env.DB_PORT_ONE || '5432'),
  user: process.env._DB_USER_ONE || process.env.DB_USER_ONE,
  password: process.env._DB_PASSWORD_ONE || process.env.DB_PASSWORD_ONE,
  database: process.env._DB_NAME_ONE || process.env.DB_NAME_ONE || 'postgres',
  ssl: { rejectUnauthorized: false }
});

const pool2 = new pg.Pool({
  host: process.env._DB_HOST_TWO || process.env.DB_HOST_TWO,
  port: parseInt(process.env._DB_PORT_TWO || process.env.DB_PORT_TWO || '5432'),
  user: process.env._DB_USER_TWO || process.env.DB_USER_TWO,
  password: process.env._DB_PASSWORD_TWO || process.env.DB_PASSWORD_TWO,
  database: process.env._DB_NAME_TWO || process.env.DB_NAME_TWO || 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkDuplicates(client, label, query, deleteQueryBuilder) {
  try {
    const res = await client.query(query);
    if (res.rowCount > 0) {
      console.log(`\n🚨 FOUND DUPLICATES IN [${label}]:`);
      console.log(JSON.stringify(res.rows, null, 2));
      if (deleteQueryBuilder) {
        console.log(`💡 Cleanup Query for [${label}]:`);
        console.log(deleteQueryBuilder());
      }
    } else {
      console.log(`✅ No duplicates found in [${label}]`);
    }
  } catch (err) {
    console.error(`Error checking [${label}]:`, err.message);
  }
}

async function run() {
  try {
    console.log("=== DB1 INSPECTION ===");
    const client1 = await pool1.connect();
    
    // 1. enterprises (owner_user_id, lower(trim(code)))
    await checkDuplicates(
      client1,
      "enterprises (owner_user_id, code)",
      `SELECT owner_user_id, lower(trim(code)) as clean_code, COUNT(*) 
       FROM enterprises 
       GROUP BY owner_user_id, lower(trim(code)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM enterprises a USING (
  SELECT MIN(id) as keep_id, owner_user_id, lower(trim(code)) as clean_code
  FROM enterprises
  GROUP BY owner_user_id, lower(trim(code))
  HAVING COUNT(*) > 1
) b
WHERE a.owner_user_id = b.owner_user_id 
  AND lower(trim(a.code)) = b.clean_code 
  AND a.id <> b.keep_id;`
    );

    // 2. organizations name
    await checkDuplicates(
      client1,
      "organizations name (company_id, name)",
      `SELECT company_id, lower(trim(name)) as clean_name, COUNT(*) 
       FROM organizations 
       WHERE deleted_at IS NULL AND name IS NOT NULL 
       GROUP BY company_id, lower(trim(name)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM organizations a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(name)) as clean_name
  FROM organizations
  WHERE deleted_at IS NULL AND name IS NOT NULL
  GROUP BY company_id, lower(trim(name))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.name)) = b.clean_name 
  AND a.deleted_at IS NULL 
  AND a.name IS NOT NULL
  AND a.id <> b.keep_id;`
    );

    // 3. organizations code
    await checkDuplicates(
      client1,
      "organizations code (company_id, organization_code)",
      `SELECT company_id, lower(trim(organization_code)) as clean_code, COUNT(*) 
       FROM organizations 
       WHERE deleted_at IS NULL AND organization_code IS NOT NULL 
       GROUP BY company_id, lower(trim(organization_code)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM organizations a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(organization_code)) as clean_code
  FROM organizations
  WHERE deleted_at IS NULL AND organization_code IS NOT NULL
  GROUP BY company_id, lower(trim(organization_code))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.organization_code)) = b.clean_code 
  AND a.deleted_at IS NULL 
  AND a.organization_code IS NOT NULL
  AND a.id <> b.keep_id;`
    );

    client1.release();

    console.log("\n=== DB2 INSPECTION ===");
    const client2 = await pool2.connect();

    // 4. warehouses (company_id, warehouse_code)
    await checkDuplicates(
      client2,
      "warehouses (company_id, warehouse_code)",
      `SELECT company_id, lower(trim(warehouse_code)) as clean_code, COUNT(*) 
       FROM warehouses 
       WHERE deleted_at IS NULL AND warehouse_code IS NOT NULL 
       GROUP BY company_id, lower(trim(warehouse_code)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM warehouses a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(warehouse_code)) as clean_code
  FROM warehouses
  WHERE deleted_at IS NULL AND warehouse_code IS NOT NULL
  GROUP BY company_id, lower(trim(warehouse_code))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.warehouse_code)) = b.clean_code 
  AND a.deleted_at IS NULL 
  AND a.warehouse_code IS NOT NULL
  AND a.id <> b.keep_id;`
    );

    // 5. bin_locations (company_id, warehouse_id, bin_code)
    await checkDuplicates(
      client2,
      "bin_locations (company_id, warehouse_id, bin_code)",
      `SELECT company_id, warehouse_id, lower(trim(bin_code)) as clean_code, COUNT(*) 
       FROM bin_locations 
       WHERE bin_code IS NOT NULL 
       GROUP BY company_id, warehouse_id, lower(trim(bin_code)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM bin_locations a USING (
  SELECT MIN(id) as keep_id, company_id, warehouse_id, lower(trim(bin_code)) as clean_code
  FROM bin_locations
  WHERE bin_code IS NOT NULL
  GROUP BY company_id, warehouse_id, lower(trim(bin_code))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND a.warehouse_id = b.warehouse_id
  AND lower(trim(a.bin_code)) = b.clean_code 
  AND a.bin_code IS NOT NULL
  AND a.id <> b.keep_id;`
    );

    // 6. products sku
    await checkDuplicates(
      client2,
      "products sku (company_id, sku)",
      `SELECT company_id, lower(trim(sku)) as clean_sku, COUNT(*) 
       FROM products 
       WHERE deleted_at IS NULL AND sku IS NOT NULL 
       GROUP BY company_id, lower(trim(sku)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM products a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(sku)) as clean_sku
  FROM products
  WHERE deleted_at IS NULL AND sku IS NOT NULL
  GROUP BY company_id, lower(trim(sku))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.sku)) = b.clean_sku 
  AND a.deleted_at IS NULL 
  AND a.sku IS NOT NULL
  AND a.id <> b.keep_id;`
    );

    // 7. products product_code
    await checkDuplicates(
      client2,
      "products product_code (company_id, product_code)",
      `SELECT company_id, lower(trim(product_code)) as clean_code, COUNT(*) 
       FROM products 
       WHERE deleted_at IS NULL AND product_code IS NOT NULL 
       GROUP BY company_id, lower(trim(product_code)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM products a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(product_code)) as clean_code
  FROM products
  WHERE deleted_at IS NULL AND product_code IS NOT NULL
  GROUP BY company_id, lower(trim(product_code))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.product_code)) = b.clean_code 
  AND a.deleted_at IS NULL 
  AND a.product_code IS NOT NULL
  AND a.id <> b.keep_id;`
    );

    // 8. product_variants sku
    await checkDuplicates(
      client2,
      "product_variants sku (company_id, sku)",
      `SELECT company_id, lower(trim(sku)) as clean_sku, COUNT(*) 
       FROM product_variants 
       WHERE deleted_at IS NULL AND sku IS NOT NULL 
       GROUP BY company_id, lower(trim(sku)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM product_variants a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(sku)) as clean_sku
  FROM product_variants
  WHERE deleted_at IS NULL AND sku IS NOT NULL
  GROUP BY company_id, lower(trim(sku))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.sku)) = b.clean_sku 
  AND a.deleted_at IS NULL 
  AND a.sku IS NOT NULL
  AND a.id <> b.keep_id;`
    );

    // 9. product_variants qr_identifier
    await checkDuplicates(
      client2,
      "product_variants qr_identifier (company_id, qr_identifier)",
      `SELECT company_id, lower(trim(qr_identifier)) as clean_qr, COUNT(*) 
       FROM product_variants 
       WHERE deleted_at IS NULL AND qr_identifier IS NOT NULL 
       GROUP BY company_id, lower(trim(qr_identifier)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM product_variants a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(qr_identifier)) as clean_qr
  FROM product_variants
  WHERE deleted_at IS NULL AND qr_identifier IS NOT NULL
  GROUP BY company_id, lower(trim(qr_identifier))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.qr_identifier)) = b.clean_qr 
  AND a.deleted_at IS NULL 
  AND a.qr_identifier IS NOT NULL
  AND a.id <> b.keep_id;`
    );

    // 10. pick_lists (company_id, pick_list_code)
    await checkDuplicates(
      client2,
      "pick_lists (company_id, pick_list_code)",
      `SELECT company_id, lower(trim(pick_list_code)) as clean_code, COUNT(*) 
       FROM pick_lists 
       GROUP BY company_id, lower(trim(pick_list_code)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM pick_lists a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(pick_list_code)) as clean_code
  FROM pick_lists
  GROUP BY company_id, lower(trim(pick_list_code))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.pick_list_code)) = b.clean_code 
  AND a.id <> b.keep_id;`
    );

    // 11. packing_workbenches (company_id, workbench_code)
    await checkDuplicates(
      client2,
      "packing_workbenches (company_id, workbench_code)",
      `SELECT company_id, lower(trim(workbench_code)) as clean_code, COUNT(*) 
       FROM packing_workbenches 
       GROUP BY company_id, lower(trim(workbench_code)) 
       HAVING COUNT(*) > 1;`,
      () => `DELETE FROM packing_workbenches a USING (
  SELECT MIN(id) as keep_id, company_id, lower(trim(workbench_code)) as clean_code
  FROM packing_workbenches
  GROUP BY company_id, lower(trim(workbench_code))
  HAVING COUNT(*) > 1
) b
WHERE a.company_id = b.company_id 
  AND lower(trim(a.workbench_code)) = b.clean_code 
  AND a.id <> b.keep_id;`
    );

    client2.release();

  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await pool1.end();
    await pool2.end();
  }
}

run();
