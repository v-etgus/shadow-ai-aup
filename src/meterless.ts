export type MeterlessHealth = "online" | "unauthorized" | "offline";

function normalizeBase(url: string): string {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  u = u.replace(/\/+$/, "");
  u = u.replace(/\/v1(\/chat\/completions|\/models|\/healthz)?$/i, "");
  return `${u}/v1`;
}

export function meterlessConfig() {
  const baseUrl = normalizeBase(process.env.METERLESS_BASE_URL || "http://127.0.0.1:8088/v1");
  const token = process.env.METERLESS_RUNTIME_TOKEN || "";
  const model = process.env.METERLESS_MODEL || "meterless/auto";
  if (!token || token === "rt-local") throw new Error("Set METERLESS_RUNTIME_TOKEN (not rt-local)");
  return { baseUrl, token, model };
}

export async function meterlessHealth(): Promise<MeterlessHealth> {
  const { baseUrl, token } = meterlessConfig();
  try {
    const res = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${token}`, "meterless-app": "shadow-ai-aup" },
    });
    if (res.status === 401 || res.status === 403) return "unauthorized";
    if (!res.ok) return "offline";
    const body: any = await res.json();
    const ids = (body.data || []).map((m: any) => m.id).filter(Boolean);
    return ids.some((id: string) => id.startsWith("meterless/")) ? "online" : "offline";
  } catch {
    return "offline";
  }
}

export async function meterlessChat(userText: string): Promise<{ text: string; model?: string }> {
  const { baseUrl, token, model } = meterlessConfig();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "meterless-app": "shadow-ai-aup",
      "meterless-scope": "user",
    },
    body: JSON.stringify({ model, messages: [{ role: "user", content: userText }] }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`meterless ${res.status}: ${await res.text()}`);
  const body: any = await res.json();
  const text = body.choices?.[0]?.message?.content ?? "";
  return { text: typeof text === "string" ? text : JSON.stringify(text), model: body.model };
}