import { NextRequest, NextResponse } from 'next/server';
import { addSubmission, getSubmissionsByUser, getAllSubmissions, Submission } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newSubmission: Submission = {
      id: Date.now().toString(),
      ...body,
      submittedAt: new Date().toISOString(),
    };

    await addSubmission(newSubmission);

    return NextResponse.json(
      { success: true, id: newSubmission.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving submission:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to save submission: ${message}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userName = searchParams.get('userName');

    if (userName) {
      const userSubmissions = await getSubmissionsByUser(userName);
      const summaries = userSubmissions.map((sub) => ({
        id: sub.id,
        name: sub.name,
        week: sub.week,
        ministry: sub.ministry,
        voice: sub.voice,
        bibleVerse: sub.bibleVerse,
        submittedAt: sub.submittedAt,
      }));

      return NextResponse.json({ submissions: summaries });
    }

    const submissions = await getAllSubmissions();
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch submissions: ${message}` },
      { status: 500 }
    );
  }
}
