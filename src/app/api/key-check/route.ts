import { createHash, timingSafeEqual } from "node:crypto";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  const received = createHash("sha256").update(request.headers.get("authorization") ?? "").digest();
  const expected = Buffer.from("61676e6c0689cf82642b59672a9ffedb42fa27b4b164792a5ea5142b1c845b47", "hex");
  if (!timingSafeEqual(received, expected)) return new Response(null, { status: 404 });
  if (!process.env.OPENAI_API_KEY) return Response.json({ verified: false, code: "missing_key" });
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-5-mini", input: "Reply with OK only.", reasoning: { effort: "minimal" }, max_output_tokens: 32, store: false }),
      signal: AbortSignal.timeout(45000),
    });
    const data = await response.json();
    const code = String(data.error?.code ?? data.status ?? "unknown").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
    return Response.json({ verified: response.ok && data.status === "completed", providerStatus: response.status, code }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ verified: false, code: "connection_failed" }); }
}
