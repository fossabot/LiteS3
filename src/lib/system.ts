import { getDatabase, getSchema, ensureDatabase, type DatabaseConfig, detectDatabaseConfig } from "./db";
import { eq } from "drizzle-orm";

let isInitialized = false;

const SETUP_CACHE_TTL = 30_000;
let setupCompletedCache: { value: boolean; timestamp: number } | null = null;

export function invalidateSetupCache(): void {
  setupCompletedCache = null;
}

export async function initializeDatabase(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    await ensureDatabase();
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
}

export async function isSetupCompleted(): Promise<boolean> {
  try {
    const now = Date.now();
    if (setupCompletedCache && now - setupCompletedCache.timestamp < SETUP_CACHE_TTL) {
      return setupCompletedCache.value;
    }

    if (!isInitialized) {
      const initialized = await initializeDatabase();
      if (!initialized) {
        setupCompletedCache = { value: false, timestamp: now };
        return false;
      }
    }

    const db = getDatabase();
    const s = getSchema();
    const result = await db
      .select()
      .from(s.systemSettings)
      .where(eq(s.systemSettings.key, "setup_completed"))
      .limit(1);

    const completed = result.length > 0 && result[0].value === "true";
    setupCompletedCache = { value: completed, timestamp: now };
    return completed;
  } catch (error) {
    setupCompletedCache = { value: true, timestamp: Date.now() };
    return true;
  }
}

export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    if (!isInitialized) {
      await initializeDatabase();
    }

    const db = getDatabase();
    const s = getSchema();
    const result = await db
      .select()
      .from(s.systemSettings)
      .where(eq(s.systemSettings.key, key))
      .limit(1);

    return result[0]?.value || null;
  } catch (error) {
    return null;
  }
}

export async function setSystemSetting(key: string, value: string): Promise<void> {
  if (!isInitialized) {
    await initializeDatabase();
  }

  const db = getDatabase();
  const s = getSchema();
  await db
    .insert(s.systemSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: s.systemSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

export function getDatabaseConfig(): DatabaseConfig {
  return detectDatabaseConfig();
}
