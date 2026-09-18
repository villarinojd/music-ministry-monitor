import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

async function getSubmissionsFile() {
  await ensureDataDir();
  const filePath = path.join(dataDir, 'submissions.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSubmissionsFile(data: any[]) {
  await ensureDataDir();
  const filePath = path.join(dataDir, 'submissions.json');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const submissions = await getSubmissionsFile();

    const newSubmission = {
      id: Date.now().toString(),
      ...body,
      submittedAt: new Date().toISOString(),
    };

    submissions.push(newSubmission);
    await saveSubmissionsFile(submissions);

    return NextResponse.json(
      { success: true, id: newSubmission.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving submission:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userName = searchParams.get('userName');

    const submissions = await getSubmissionsFile();

    if (userName) {
      const userSubmissions = submissions
        .filter((sub: any) => sub.name === userName)
        .map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          week: sub.week,
          ministry: sub.ministry,
          voice: sub.voice,
          bibleVerse: sub.bibleVerse,
          submittedAt: sub.submittedAt,
        }))
        .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      return NextResponse.json({ submissions: userSubmissions });
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
