import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

export default defineConfig({
  // 👇 FIXED PATH
  schema: "app/api/prisma/schema.prisma",

  datasource: {
      url: env("DATABASE_URL")

  },
});
