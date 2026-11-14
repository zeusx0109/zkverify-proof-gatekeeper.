import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
export interface SeenProofStore { has(reference: string): Promise<boolean>; add(reference: string): Promise<void>; }
export class JsonSeenProofStore implements SeenProofStore {
  private readonly entries = new Set<string>();
  private loaded = false;
  constructor(private readonly filePath: string) {}
  private async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const parsed: unknown = JSON.parse(await readFile(this.filePath, "utf8"));
      if (Array.isArray(parsed)) for (const item of parsed) if (typeof item === "string") this.entries.add(item.toLowerCase());
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    this.loaded = true;
  }
  async has(reference: string): Promise<boolean> { await this.load(); return this.entries.has(reference.toLowerCase()); }
  async add(reference: string): Promise<void> {
    await this.load(); this.entries.add(reference.toLowerCase());
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify([...this.entries].sort(), null, 2), { mode: 0o600 });
  }
}
