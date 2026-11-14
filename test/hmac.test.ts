import { describe, expect, it } from "vitest";
import { signBody, verifyBodySignature } from "../src/security/hmac.js";
describe("HMAC", () => {
  it("verifies the exact raw body", () => {
    const body = Buffer.from('{"ok":true}');
    const signature = signBody(body, "test-secret");
    expect(verifyBodySignature(body, signature, "test-secret")).toBe(true);
    expect(verifyBodySignature(Buffer.from('{"ok": true}'), signature, "test-secret")).toBe(false);
  });
  it("rejects malformed signatures", () => { expect(verifyBodySignature(Buffer.from("{}"), "nope", "secret")).toBe(false); });
});
