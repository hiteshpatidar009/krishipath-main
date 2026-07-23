const fs = require('fs');

const schemaPath = 'D:/All_project/KrishiPathMain/backend/src/infrastructure/database/postgres/schemas/db1/all.schema.ts';
const patchPath = 'D:/All_project/KrishiPathMain/backend/patch_schema.txt';

let schemaContent = fs.readFileSync(schemaPath, 'utf8');
const patchContent = fs.readFileSync(patchPath, 'utf8');

const anchor = 'typeCodeUnique: uniqueIndex("master_data_items_type_code_unique").on(table.type, table.code),\n}));';
const idx = schemaContent.indexOf(anchor);

if (idx !== -1) {
  const goodContent = schemaContent.substring(0, idx + anchor.length);
  const finalContent = goodContent + '\n\n' + patchContent;
  fs.writeFileSync(schemaPath, finalContent);
  console.log("Successfully patched all.schema.ts");
} else {
  console.error("Anchor not found in schema");
}
