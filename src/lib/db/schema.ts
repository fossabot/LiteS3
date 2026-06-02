import * as sqliteSchema from "./schema-sqlite";
import * as pgSchema from "./schema-pg";
import type { DatabaseDriver } from "./adapter";

export type SchemaType = typeof sqliteSchema;

let currentDriver: DatabaseDriver = "sqlite";
let currentSchema: SchemaType = sqliteSchema;

export function setSchemaDriver(driver: DatabaseDriver): void {
  currentDriver = driver;
  currentSchema = driver === "postgresql" ? (pgSchema as unknown as SchemaType) : sqliteSchema;
}

export function getSchema(): SchemaType {
  return currentSchema;
}

export function getSchemaDriver(): DatabaseDriver {
  return currentDriver;
}

export type User = typeof sqliteSchema.users.$inferSelect;
export type NewUser = typeof sqliteSchema.users.$inferInsert;
export type Bucket = typeof sqliteSchema.buckets.$inferSelect;
export type NewBucket = typeof sqliteSchema.buckets.$inferInsert;
export type SystemSetting = typeof sqliteSchema.systemSettings.$inferSelect;
export type NewSystemSetting = typeof sqliteSchema.systemSettings.$inferInsert;

export { sqliteSchema, pgSchema };
