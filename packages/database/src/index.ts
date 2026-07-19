import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { VisitorSignalInput } from "@portfolio/contracts";

export type VisitorSignal = VisitorSignalInput & {
  id: string;
  status: string;
  createdAt: Date;
};

export type ProfileStats = {
  views: number;
  uniqueVisitors: string[];
  updatedAt: Date;
};

function dataPath(fileName: string) {
  return path.join(process.cwd(), ".data", fileName);
}

function normalizeStats(stats: Partial<ProfileStats>): ProfileStats {
  return {
    views: Number.isFinite(stats.views) ? Number(stats.views) : 0,
    uniqueVisitors: Array.isArray(stats.uniqueVisitors)
      ? stats.uniqueVisitors
      : [],
    updatedAt: stats.updatedAt instanceof Date ? stats.updatedAt : new Date(),
  };
}

function hashVisitor(visitorIp: string) {
  return createHash("sha256").update(visitorIp.trim()).digest("hex");
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(dataPath(fileName), "utf8");
    return JSON.parse(raw, (key, value) =>
      key === "createdAt" || key === "updatedAt" ? new Date(value) : value,
    );
  } catch {
    return fallback;
  }
}

async function writeJson(fileName: string, value: unknown) {
  const filePath = dataPath(fileName);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2));
}

async function readSignals(): Promise<VisitorSignal[]> {
  return readJson<VisitorSignal[]>("visitor-signals.json", []);
}

async function writeSignals(signals: VisitorSignal[]) {
  await writeJson("visitor-signals.json", signals);
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

export async function recordProfileView(visitorIp: string) {
  const stats = normalizeStats(
    await readJson<Partial<ProfileStats>>("profile-stats.json", {
      views: 0,
      uniqueVisitors: [],
      updatedAt: new Date(),
    }),
  );
  const visitorId = hashVisitor(visitorIp || "unknown");

  if (!stats.uniqueVisitors.includes(visitorId)) {
    stats.uniqueVisitors.push(visitorId);
  }

  const nextStats = {
    views: stats.uniqueVisitors.length,
    uniqueVisitors: stats.uniqueVisitors,
    updatedAt: new Date(),
  };
  await writeJson("profile-stats.json", nextStats);
  return nextStats;
}
export async function getProfileStats() {
  return normalizeStats(
    await readJson<Partial<ProfileStats>>("profile-stats.json", {
      views: 0,
      uniqueVisitors: [],
      updatedAt: new Date(),
    }),
  );
}
