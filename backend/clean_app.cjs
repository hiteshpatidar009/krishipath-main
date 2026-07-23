const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'app.ts');
let content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');

const keywordsToRemove = [
  'import { CompanyModule }', 'CompanyModule', 'this.companyModule = new CompanyModule()',
  'import { SubscriptionModule }', 'SubscriptionModule', 'this.subscriptionModule = new SubscriptionModule()',
  'import { SupportTicketModule }', 'SupportTicketModule', 'this.supportTicketModule = new SupportTicketModule()',
  'import { WorkflowApprovalModule }', 'WorkflowApprovalModule', 'this.workflowApprovalModule = new WorkflowApprovalModule()',
];

const regexToRemove = [
  /^\s*\/\/\s*import .*Module.*$/i,
  /^\s*\/\/\s*private readonly .*Module: .*Module;.*$/i,
  /^\s*\/\/\s*this\..*Module = new .*Module\(\);.*$/i,
  /^\s*\/\/\s*\{ module: ".*", path: ".*", router: this\..*\.getRouter\(\) \},.*$/i,
  /^\s*\/\/\s*\{ module: ".*", path: ".*", router: this\..*\.get.*Router\(\) \},.*$/i,
];

const cleanedLines = lines.filter(line => {
  if (keywordsToRemove.some(k => line.includes(k))) return false;
  if (regexToRemove.some(r => r.test(line))) return false;
  if (line.includes('this.companyModule.getRouter()') || line.includes('this.companyModule.getTenantDirectoryRouter()')) return false;
  return true;
});

fs.writeFileSync(appPath, cleanedLines.join('\n'));
console.log('Cleaned app.ts successfully');
