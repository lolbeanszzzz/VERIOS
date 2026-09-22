import { adminToken, json } from "../_lib.js";

export default function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const password = String(req.body?.password || "");
  if (!password || password !== process.env.ADMIN_PASSWORD) return json(res, 401, { error: "Invalid credentials" });
  return json(res, 200, { token: adminToken(password) });
}
