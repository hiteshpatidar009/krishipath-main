const fs = require("fs");
const path = require("path");

const folders = [
  "src",
  "src/config",
  "src/database",
  "src/logger",
  "src/routes",
  "src/middlewares",

  "src/modules",
  "src/modules/auth",
  "src/modules/whatsapp",
  "src/modules/groups",
  "src/modules/messages",
  "src/modules/health",

  "src/shared",
  "src/shared/constants",
  "src/shared/helpers",
  "src/shared/types",
  "src/shared/utils",

  "uploads",
  "uploads/images",
  "uploads/videos",
  "uploads/audios",
  "uploads/documents",

  "logs",
  "docs",
  "tests"
];

const files = [
  ".env",
  ".env.example",
  ".gitignore",
  "README.md",
  "Dockerfile",
  "docker-compose.yml",

  "src/server.ts",
  "src/app.ts",

  "src/config/env.ts",

  "src/database/mongodb.ts",

  "src/logger/logger.ts",

  "src/routes/index.ts",

  "src/middlewares/error.middleware.ts",
  "src/middlewares/not-found.middleware.ts",

  "src/modules/auth/auth.service.ts",

  "src/modules/whatsapp/whatsapp.service.ts",
  "src/modules/whatsapp/events.ts",

  "src/modules/groups/group.service.ts",

  "src/modules/messages/message.service.ts",

  "src/modules/health/health.controller.ts"
];

folders.forEach(folder => {
  fs.mkdirSync(path.join(process.cwd(), folder), { recursive: true });
});

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }
});

console.log("✅ Project structure created successfully!");