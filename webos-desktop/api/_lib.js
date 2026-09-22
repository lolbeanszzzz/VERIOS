import crypto from "node:crypto";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
}

export function hashPin(pin) {
  return crypto.scryptSync(pin, process.env.PIN_HASH_SALT || "verios-pin-salt", 64).toString("hex");
}

export function adminToken(password) {
  return crypto.createHmac("sha256", process.env.ADMIN_PASSWORD || "").update(password).digest("hex");
}

export function isAdmin(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  return Boolean(token && token === adminToken(process.env.ADMIN_PASSWORD || ""));
}

export function validPin(pin) {
  return typeof pin === "string" && /^[0-9]{6}$/.test(pin);
}

export { pool };
