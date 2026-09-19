import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const SUBMISSIONS_KEY = 'submissions';

export interface Submission {
  id: string;
  name: string;
  voice: string;
  bibleVerse: string;
  week: string;
  ministry: 'choir' | 'orchestra';
  attendance: Record<string, string>;
  practices: Record<string, string>;
  performances: Record<string, string>;
  ministryRequirements: Record<string, string>;
  personalWalk: Record<string, string>;
  submittedAt: string;
  updatedAt?: string;
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const data = await redis.get<Submission[]>(SUBMISSIONS_KEY);
  return data || [];
}

async function saveAllSubmissions(submissions: Submission[]): Promise<void> {
  await redis.set(SUBMISSIONS_KEY, submissions);
}

export async function addSubmission(submission: Submission): Promise<void> {
  const submissions = await getAllSubmissions();
  submissions.push(submission);
  await saveAllSubmissions(submissions);
}

export async function updateSubmission(
  id: string,
  updates: Partial<Submission>
): Promise<Submission | undefined> {
  const submissions = await getAllSubmissions();
  const index = submissions.findIndex((sub) => sub.id === id);
  if (index === -1) return undefined;

  submissions[index] = {
    ...submissions[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  await saveAllSubmissions(submissions);
  return submissions[index];
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  const submissions = await getAllSubmissions();
  return submissions.find((sub) => sub.id === id);
}

export async function getSubmissionsByUser(name: string): Promise<Submission[]> {
  const submissions = await getAllSubmissions();
  return submissions
    .filter((sub) => sub.name === name)
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
}

export async function getSubmissionByUserAndWeek(
  name: string,
  week: string
): Promise<Submission | undefined> {
  const submissions = await getAllSubmissions();
  return submissions.find((sub) => sub.name === name && sub.week === week);
}

export async function getConflictsForMerge(
  names: string[]
): Promise<Record<string, Submission[]>> {
  const submissions = await getAllSubmissions();
  const relevant = submissions.filter((sub) => names.includes(sub.name));

  const byWeek: Record<string, Submission[]> = {};
  for (const sub of relevant) {
    (byWeek[sub.week] ??= []).push(sub);
  }

  const conflicts: Record<string, Submission[]> = {};
  for (const [week, subs] of Object.entries(byWeek)) {
    if (subs.length > 1) conflicts[week] = subs;
  }
  return conflicts;
}

export async function mergeUsers(
  names: string[],
  targetName: string,
  conflictResolutions: Record<string, string>
): Promise<{ merged: number; deleted: number }> {
  const submissions = await getAllSubmissions();
  const relevant = submissions.filter((sub) => names.includes(sub.name));

  const byWeek = new Map<string, Submission[]>();
  for (const sub of relevant) {
    const list = byWeek.get(sub.week) || [];
    list.push(sub);
    byWeek.set(sub.week, list);
  }

  const idsToDelete = new Set<string>();
  const idsToRename = new Set<string>();

  for (const [week, subs] of byWeek) {
    if (subs.length === 1) {
      idsToRename.add(subs[0].id);
    } else {
      const keepId = conflictResolutions[week];
      if (!keepId || !subs.some((sub) => sub.id === keepId)) {
        throw new Error(`Missing or invalid conflict resolution for week ${week}`);
      }
      for (const sub of subs) {
        if (sub.id === keepId) idsToRename.add(sub.id);
        else idsToDelete.add(sub.id);
      }
    }
  }

  const updated = submissions
    .filter((sub) => !idsToDelete.has(sub.id))
    .map((sub) =>
      idsToRename.has(sub.id)
        ? { ...sub, name: targetName, updatedAt: new Date().toISOString() }
        : sub
    );

  await saveAllSubmissions(updated);
  return { merged: idsToRename.size, deleted: idsToDelete.size };
}
