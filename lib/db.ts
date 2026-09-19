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
  personalWalk: Record<string, boolean>;
  submittedAt: string;
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const data = await redis.get<Submission[]>(SUBMISSIONS_KEY);
  return data || [];
}

export async function addSubmission(submission: Submission): Promise<void> {
  const submissions = await getAllSubmissions();
  submissions.push(submission);
  await redis.set(SUBMISSIONS_KEY, submissions);
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  const submissions = await getAllSubmissions();
  return submissions.find((sub) => sub.id === id);
}

export async function getSubmissionsByUser(name: string): Promise<Submission[]> {
  const submissions = await getAllSubmissions();
  return submissions
    .filter((sub) => sub.name === name)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}
