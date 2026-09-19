import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_KEY } from '@/lib/adminAuth';
import { getConflictsForMerge, mergeUsers } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, names, targetName, conflictResolutions } = body;

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!Array.isArray(names) || names.length < 2 || !targetName) {
      return NextResponse.json(
        { error: 'names (2 or more) and targetName are required' },
        { status: 400 }
      );
    }

    const conflicts = await getConflictsForMerge(names);
    const resolutions = conflictResolutions || {};
    const unresolved = Object.keys(conflicts).filter((week) => !resolutions[week]);

    if (unresolved.length > 0) {
      return NextResponse.json({ error: 'conflicts', conflicts }, { status: 409 });
    }

    const result = await mergeUsers(names, targetName, resolutions);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error merging users:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to merge: ${message}` },
      { status: 500 }
    );
  }
}
