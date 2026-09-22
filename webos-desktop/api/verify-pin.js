import { hashPin, json, pool, validPin } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const pin = String(req.body?.pin || "");
  if (!validPin(pin)) return json(res, 400, { valid: false, error: "Invalid PIN" });
  try {
    const result = await pool.query("SELECT id FROM unlock_pins WHERE pin_hash = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now()) LIMIT 1", [hashPin(pin)]);
    return json(res, 200, { valid: result.rowCount === 1 });
  } catch (error) {
    console.error("PIN verification error", error);
    return json(res, 503, { valid: false, error: "PIN service unavailable" });
  }
}
