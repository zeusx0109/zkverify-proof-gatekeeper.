import type { ProofBundle } from "../types.js";

type KurierStatus = "Submitted" | "IncludedInBlock" | "Finalized" | "Failed" | string;

interface KurierJob {
  jobId?: string;
  id?: string;
  status?: KurierStatus;
  [key: string]: unknown;
}

/**
 * REST adapter based on the Agent Games build guide.
 * Confirm the current Kurier response schema and auth requirements before production.
 */
export async function submitToKurier(
  bundle: ProofBundle,
  apiKey: string,
  apiUrl: string,
  vkHash: string,
  timeoutMs: number
): Promise<{ status: KurierStatus; job: KurierJob }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/submit-proof/${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        proofType: "groth16",
        vkRegistered: true,
        proofOptions: { library: "snarkjs", curve: "bn128" },
        proofData: { proof: bundle.proof, publicSignals: bundle.public_signals, vk: vkHash }
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Kurier submit failed: HTTP ${response.status}`);
    const job = await response.json() as KurierJob;
    const jobId = String(job.jobId ?? job.id ?? "");
    if (!jobId) throw new Error("Kurier response did not include a recognizable job ID");
    return await pollKurierJob(jobId, apiKey, apiUrl, timeoutMs, controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function pollKurierJob(
  jobId: string,
  apiKey: string,
  apiUrl: string,
  timeoutMs: number,
  signal: AbortSignal
): Promise<{ status: KurierStatus; job: KurierJob }> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/job/${encodeURIComponent(jobId)}/${encodeURIComponent(apiKey)}`,
      { headers: { accept: "application/json" }, signal }
    );
    if (!response.ok) throw new Error(`Kurier polling failed: HTTP ${response.status}`);
    const job = await response.json() as KurierJob;
    const status = String(job.status ?? "Unknown");
    if (status === "Finalized") return { status, job };
    if (status === "Failed") throw new Error("Kurier proof verification failed");
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("Kurier did not finalize before the agent deadline");
}
