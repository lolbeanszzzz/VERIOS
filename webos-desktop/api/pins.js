import { hashPin, isAdmin, json, pool, validPin } from "./_lib.js";

export default async function handler(req, res) {
  if (!isAdmin(req)) return json(res, 401, { error: "Unauthorized" });
  try {
    if (req.method === "GET") {
      const result = await pool.query("SELECT id, label, expires_at, revoked_at, created_at FROM unlock_pins ORDER BY created_at DESC");
      return json(res, 200, { pins: result.rows });
    }
    if (req.method === "POST") {
      const { pin, label = "", expiresAt = null } = req.body || {};
      if (!validPin(pin)) return json(res, 400, { error: "PIN must be exactly six digits" });
      const result = await pool.query("INSERT INTO unlock_pins (pin_hash, label, expires_at) VALUES ($1, $2, $3) RETURNING id, label, expires_at, revoked_at, created_at", [hashPin(pin), String(label).slice(0, 80), expiresAt || null]);
      return json(res, 201, { pin: result.rows[0] });
    }
    if (req.method === "PATCH") {
      const { id, action } = req.body || {};
      if (!id || !["revoke", "restore"].includes(action)) return json(res, 400, { error: "Invalid request" });
      await pool.query("UPDATE unlock_pins SET revoked_at = $1 WHERE id = $2", [action === "revoke" ? new Date() : null, id]);
      return json(res, 200, { ok: true });
    }
    if (req.method === "DELETE") {
      if (!req.body?.id) return json(res, 400, { error: "PIN id is required" });
      await pool.query("DELETE FROM unlock_pins WHERE id = $1", [req.body.id]);
      return json(res, 200, { ok: true });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("PIN API error", error);
    return json(res, 500, { error: "PIN service unavailable" });
  }
}
