import { readFileSync } from "node:fs";
import path from "node:path";
import { rootCertificates } from "node:tls";
import postgres from "postgres";
// BUILD-01 only supports this isolated development database. Expand deliberately for preview.
const developmentRef = "selvtumjitqxtwpmgcgb";


export function createReviewConnection() {
  if (process.env.APP_ENV !== "development" || process.env.VERCEL_ENV) {
    throw new Error("Database environment has not been approved for this deployment.");
  }
  const connection = process.env.DATABASE_URL;
  if (!connection) throw new Error("Database connection is not configured.");
  const parsed = new URL(connection);
  if (parsed.protocol !== "postgresql:" || parsed.hostname !== "aws-0-us-west-2.pooler.supabase.com" || parsed.port !== "5432" || parsed.pathname !== "/postgres" || decodeURIComponent(parsed.username) !== `postgres.${developmentRef}` || parsed.search || !parsed.password) {
    throw new Error("Unexpected database destination.");
  }
  const ca = readFileSync(path.join(process.cwd(), "certs/supabase-ca.crt"), "utf8");
  const client = postgres(connection, {
    ssl: { rejectUnauthorized: true, ca: [...rootCertificates, ca] },
    prepare: false,
    max: 1,
    connect_timeout: 15,
    idle_timeout: 20,
  });
  return client;
}


