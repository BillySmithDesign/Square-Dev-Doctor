import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const SQUARE_SESSION_COOKIE = "square_doctor_session";

export type SquareConnection = {
  accessToken: string;
  environment: "sandbox" | "production";
  locationId?: string;
  vercelToken?: string;
  vercelProjectId?: string;
  vercelTeamId?: string;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return createHash("sha256").update(value).digest();
}

export function encryptConnection(value: SquareConnection) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secret(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((item) => item.toString("base64url")).join(".");
}

export function decryptConnection(value: string | undefined): SquareConnection | null {
  if (!value) return null;
  try {
    const [iv, tag, encrypted] = value.split(".").map((item) => Buffer.from(item, "base64url"));
    if (!iv || !tag || !encrypted) return null;
    const decipher = createDecipheriv("aes-256-gcm", secret(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")) as SquareConnection;
  } catch {
    return null;
  }
}
