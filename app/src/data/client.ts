import type { Groupe, Loi, LoiIndexEntry, ResumeEntry } from "../types";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Échec du chargement de ${url} (${response.status})`);
  return response.json() as Promise<T>;
}

let loisIndexPromise: Promise<LoiIndexEntry[]> | undefined;
export function getLoisIndex(): Promise<LoiIndexEntry[]> {
  loisIndexPromise ??= fetchJson<LoiIndexEntry[]>("/data/lois.json");
  return loisIndexPromise;
}

let groupesPromise: Promise<Groupe[]> | undefined;
export function getGroupes(): Promise<Groupe[]> {
  groupesPromise ??= fetchJson<Groupe[]>("/data/groupes.json");
  return groupesPromise;
}

let resumesPromise: Promise<Map<string, ResumeEntry>> | undefined;
export function getResumes(): Promise<Map<string, ResumeEntry>> {
  resumesPromise ??= fetchJson<ResumeEntry[]>("/data/resumes.json").then(
    (entries) => new Map(entries.map((e) => [e.id, e])),
  );
  return resumesPromise;
}

const loiDetailCache = new Map<string, Promise<Loi>>();
export function getLoiDetail(id: string): Promise<Loi> {
  let promise = loiDetailCache.get(id);
  if (!promise) {
    promise = fetchJson<Loi>(`/data/lois/${id}.json`);
    loiDetailCache.set(id, promise);
  }
  return promise;
}

export function getLoiDetails(ids: string[]): Promise<Loi[]> {
  return Promise.all(ids.map(getLoiDetail));
}
