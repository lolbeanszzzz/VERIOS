const apiBase = import.meta.env.VITE_PIN_API_URL || "";

export async function verifyUnlockPin(pin) {
  const response = await fetch(`${apiBase}/api/verify-pin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "PIN service unavailable");
  return result.valid === true;
}
