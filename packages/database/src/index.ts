import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { VisitorSignalInput } from "@portfolio/contracts";

export type VisitorSignal = VisitorSignalInput & {
  id: string;
  status: string;
  createdAt: Date;
};

function signalsPath() {
  return path.join(process.cwd(), ".data", "visitor-signals.json");
}

async function readSignals(): Promise<VisitorSignal[]> {
  try {
    const raw = await readFile(signalsPath(), "utf8");
    return JSON.parse(raw, (key, value) =>
      key === "createdAt" ? new Date(value) : value,
    );
  } catch {
    return [];
  }
}

async function writeSignals(signals: VisitorSignal[]) {
  const filePath = signalsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(signals, null, 2));
}

export async function createSignal(input: VisitorSignalInput) {
  const signal = {
    id: randomUUID(),
    ...input,
    status: "new",
    createdAt: new Date(),
  };
  const signals = await readSignals();
  signals.unshift(signal);
  await writeSignals(signals.slice(0, 100));
  return signal;
}

export async function listSignals() {
  return readSignals();
}
