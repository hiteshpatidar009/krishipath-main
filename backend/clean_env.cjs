const fs = require('fs');
const path = require('path');

// Clean validate_env.ts
const validateEnvPath = path.join(__dirname, 'src', 'infrastructure', 'config', 'validate_env.ts');
let validateEnvContent = fs.readFileSync(validateEnvPath, 'utf8');

// Remove DB2 schema definitions
validateEnvContent = validateEnvContent.replace(/\s*\/\/ # DATABASE - DB 2\s*_DB_URL_TWO[\s\S]*?_DB_SSL_TWO: envBooleanSchema\.default\(true\),/g, '');
// Remove DB3 schema definitions
validateEnvContent = validateEnvContent.replace(/\s*\/\/ # DATABASE - DB 3\s*_DB_URL_THREE[\s\S]*?_DB_SSL_THREE: envBooleanSchema\.default\(true\),/g, '');

// Remove hasDbConfig for DB2
validateEnvContent = validateEnvContent.replace(/\s*hasDbConfig\([\s\S]*?"DB2",\s*\);/g, '');
// Remove hasDbConfig for DB3
validateEnvContent = validateEnvContent.replace(/\s*hasDbConfig\([\s\S]*?"DB3",\s*\);/g, '');

// Remove DB2 aliases
validateEnvContent = validateEnvContent.replace(/\s*\/\/ # DATABASE - DB 2\s*_DB_URL_TWO[\s\S]*?_DB_SSL_TWO: \["_DB_SSL_TWO", "DB_SSL_TWO"\],/g, '');
// Remove DB3 aliases
validateEnvContent = validateEnvContent.replace(/\s*\/\/ # DATABASE - DB 3\s*_DB_URL_THREE[\s\S]*?_DB_SSL_THREE: \["_DB_SSL_THREE", "DB_SSL_THREE"\],/g, '');

fs.writeFileSync(validateEnvPath, validateEnvContent);
console.log('Cleaned validate_env.ts');

// Clean env.ts
const envPath = path.join(__dirname, 'src', 'infrastructure', 'config', 'env.ts');
let envContent = fs.readFileSync(envPath, 'utf8');

// Remove DB2 private fields
envContent = envContent.replace(/\s*private readonly _dbUrlTwo[\s\S]*?private readonly _dbSslTwo: boolean;/g, '');
// Remove DB3 private fields
envContent = envContent.replace(/\s*private readonly _dbUrlThree[\s\S]*?private readonly _dbSslThree: boolean;/g, '');

// Remove DB2 assignments in constructor
envContent = envContent.replace(/\s*this\._dbUrlTwo = config\._DB_URL_TWO;[\s\S]*?this\._dbSslTwo = config\._DB_SSL_TWO;/g, '');
// Remove DB3 assignments in constructor
envContent = envContent.replace(/\s*this\._dbUrlThree = config\._DB_URL_THREE;[\s\S]*?this\._dbSslThree = config\._DB_SSL_THREE;/g, '');

// Remove DB2 getters
envContent = envContent.replace(/\s*public get db2Options\(\)[\s\S]*?public get db2Ssl\(\)[\s\S]*?}/g, '');
// Remove DB3 getters
envContent = envContent.replace(/\s*public get db3Options\(\)[\s\S]*?public get db3Ssl\(\)[\s\S]*?}/g, '');

fs.writeFileSync(envPath, envContent);
console.log('Cleaned env.ts');

