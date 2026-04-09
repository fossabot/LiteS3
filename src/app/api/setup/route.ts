import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createDatabase, schema, setDatabaseInstance, getDatabase, ensureDatabase, type DatabaseConfig } from "@/lib/db";

let initializationCheckCache: { checked: boolean; initialized: boolean } | null = null;

async function checkIfInitialized(): Promise<boolean> {
  if (initializationCheckCache?.checked) {
    return initializationCheckCache.initialized;
  }

  try {
    await ensureDatabase();
    const db = getDatabase();

    const setupCompleted = await db
      .select()
      .from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, "setup_completed"));

    const isInitialized = setupCompleted.length > 0 && setupCompleted[0].value === "true";
    
    initializationCheckCache = { checked: true, initialized: isInitialized };
    
    return isInitialized;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isInitialized = await checkIfInitialized();
    return NextResponse.json({ initialized: isInitialized });
  } catch (error) {
    return NextResponse.json({ initialized: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isInitialized = await checkIfInitialized();
    if (isInitialized) {
      console.warn("[SECURITY] Attempted to reinitialize already setup system");
      return NextResponse.json(
        { error: "System already initialized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { step, config, admin } = body;

    const envConfigStr = process.env.DATABASE_CONFIG;
    let effectiveConfig: DatabaseConfig;
    
    if (envConfigStr) {
      try {
        effectiveConfig = JSON.parse(envConfigStr);
      } catch {
        return NextResponse.json(
          { error: "Invalid database configuration in environment" },
          { status: 500 }
        );
      }
    } else if (config) {
      effectiveConfig = config;
    } else {
      return NextResponse.json(
        { error: "No database configuration provided" },
        { status: 400 }
      );
    }

    if (step === "test-connection") {
      return await testConnection(effectiveConfig);
    }

    if (step === "initialize") {
      return await initializeSystem(effectiveConfig, admin);
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Setup failed" },
      { status: 500 }
    );
  }
}

async function testConnection(config: DatabaseConfig) {
  try {
    const db = await createDatabase(config);
    const now = new Date();
    
    await db.insert(schema.systemSettings).values({
      key: "connection_test",
      value: Date.now().toString(),
      updatedAt: now,
    }).onConflictDoUpdate({
      target: schema.systemSettings.key,
      set: { value: Date.now().toString(), updatedAt: now },
    });

    return NextResponse.json({ success: true, message: "Connection successful" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Connection failed" },
      { status: 400 }
    );
  }
}

async function initializeSystem(config: DatabaseConfig, admin: { username: string; password: string; email?: string }) {
  try {
    const db = await createDatabase(config);
    setDatabaseInstance(db, config);

    const adminId = crypto.randomUUID();
    const passwordHash = await hashPassword(admin.password);
    const now = new Date();

    await db.insert(schema.users).values({
      id: adminId,
      username: admin.username,
      passwordHash,
      email: admin.email || null,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(schema.systemSettings).values({
      key: "setup_completed",
      value: "true",
      updatedAt: now,
    });

    await db.insert(schema.systemSettings).values({
      key: "database_config",
      value: JSON.stringify(config),
      updatedAt: now,
    });

    initializationCheckCache = { checked: true, initialized: true };

    console.log("[SECURITY] System initialized successfully");

    return NextResponse.json({ 
      success: true, 
      message: "System initialized successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Initialization failed" },
      { status: 400 }
    );
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
