import { NextRequest, NextResponse } from 'next/server';
import {
  addSubmission,
  getSubmissionsByUser,
  getSubmissionByUserAndWeek,
  getAllSubmissions,
  Submission,
} from '@/lib/db';
import { ADMIN_KEY } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.week) {
      return NextResponse.json({ error: 'Name and week are required' }, { status: 400 });
    }

    const existing = await getSubmissionByUserAndWeek(body.name, body.week);
    if (existing) {
      return NextResponse.json(
        {
          error: 'duplicate',
          message: `${body.name} already has an entry for the week of ${new Date(
            body.week
          ).toLocaleDateString()}.`,
          existingId: existing.id,
        },
        { status: 409 }
      );
    }

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
    const adminKey = searchParams.get('adminKey');

    if (userName) {
      const submissions = await getSubmissionsByUser(userName);
      return NextResponse.json({ submissions });
    }

    if (adminKey === ADMIN_KEY) {
      const submissions = await getAllSubmissions();
      return NextResponse.json({ submissions });
    }

    return NextResponse.json(
      { error: 'userName or a valid adminKey is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch submissions: ${message}` },
      { status: 500 }
    );
  }
}
