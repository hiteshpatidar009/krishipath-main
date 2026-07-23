const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else if (dirPath.endsWith('.ts')) {
      callback(dirPath);
    }
  });
}

const renames = [
  ['src/modules/mandi/repositories/crop.repository.ts', 'src/modules/mandi/repositories/product.repository.ts'],
  ['src/modules/mandi/repositories/mandi-crop.repository.ts', 'src/modules/mandi/repositories/mandi-product.repository.ts'],
  ['src/modules/mandi/services/crop-admin.service.ts', 'src/modules/mandi/services/product-admin.service.ts'],
  ['src/modules/mandi/services/mandi-crop.service.ts', 'src/modules/mandi/services/mandi-product.service.ts'],
  ['src/modules/mandi/controllers/crop-admin.controller.ts', 'src/modules/mandi/controllers/product-admin.controller.ts']
];

renames.forEach(([oldPath, newPath]) => {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${oldPath} to ${newPath}`);
  }
});

const replacements = [
  { regex: /\bcropsTable\b/g, replace: 'productsTable' },
  { regex: /\bmandiCropsTable\b/g, replace: 'mandiProductsTable' },
  { regex: /\bCropRepository\b/g, replace: 'ProductRepository' },
  { regex: /\bMandiCropRepository\b/g, replace: 'MandiProductRepository' },
  { regex: /\bcropId\b/g, replace: 'productId' },
  { regex: /\bcropIds\b/g, replace: 'productIds' },
  { regex: /\bcropAdminRepo\b/g, replace: 'productAdminRepo' },
  { regex: /\bmandiCropRepo\b/g, replace: 'mandiProductRepo' },
  { regex: /\bcropRepo\b/g, replace: 'productRepo' },
  { regex: /\bCropAdminService\b/g, replace: 'ProductAdminService' },
  { regex: /\bMandiCropService\b/g, replace: 'MandiProductService' },
  { regex: /\bcropAdminService\b/g, replace: 'productAdminService' },
  { regex: /\bmandiCropService\b/g, replace: 'mandiProductService' },
  { regex: /\bCropAdminController\b/g, replace: 'ProductAdminController' },
  { regex: /\bcropAdminController\b/g, replace: 'productAdminController' },
  { regex: /\bcrops\b/g, replace: 'products' }, // Careful with this one
  { regex: /\bCrops\b/g, replace: 'Products' },
  { regex: /\bCrop\b/g, replace: 'Product' },
  { regex: /\bcrop\b/g, replace: 'product' },
  { regex: /crop\.repository/g, replace: 'product.repository' },
  { regex: /mandi-crop\.repository/g, replace: 'mandi-product.repository' },
  { regex: /crop-admin\.service/g, replace: 'product-admin.service' },
  { regex: /mandi-crop\.service/g, replace: 'mandi-product.service' },
  { regex: /crop-admin\.controller/g, replace: 'product-admin.controller' },
];

walk('src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  replacements.forEach(r => {
    newContent = newContent.replace(r.regex, r.replace);
  });
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated contents of ${filePath}`);
  }
});
