import { createHmac, timingSafeEqual } from "node:crypto";
export function signBody(rawBody: Buffer | string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}
export function verifyBodySignature(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature || !/^[a-fA-F0-9]{64}$/.test(signature)) return false;
  const expected = Buffer.from(signBody(rawBody, secret), "hex");
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
