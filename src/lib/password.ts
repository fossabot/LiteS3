import { scryptSync, randomBytes, timingSafeEqual, createHash } from "crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.includes(":")) {
    const [saltHex, hashHex] = storedHash.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const storedKey = Buffer.from(hashHex, "hex");
    const derivedKey = scryptSync(password, salt, KEY_LENGTH);
    return timingSafeEqual(storedKey, derivedKey);
  }

  const legacyHash = createHash("sha256").update(password).digest("hex");
  return legacyHash === storedHash;
}

export function isLegacyHash(storedHash: string): boolean {
  return !storedHash.includes(":");
}
