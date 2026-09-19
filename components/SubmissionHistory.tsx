'use client';

import { useState, useEffect } from 'react';
import type { Submission } from '@/lib/db';
import SubmissionsTable from './SubmissionsTable';
import MinistryReminders from './MinistryReminders';

interface SubmissionHistoryProps {
  userName: string;
  onEdit: (id: string) => void;
}

export default function SubmissionHistory({ userName, onEdit }: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/submissions?userName=${encodeURIComponent(userName)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSubmissions(data.submissions || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userName]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading submissions...</p>
      </div>
    );
  }

  const latestMinistry = submissions[submissions.length - 1]?.ministry || 'choir';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            {userName}&apos;s Weekly Reports
          </h2>
          {submissions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No submissions yet. Submit a weekly report to see it here.
            </p>
          ) : (
            <SubmissionsTable submissions={submissions} onEdit={onEdit} />
          )}
        </div>
      </div>
      <div className="lg:col-span-1">
        <MinistryReminders defaultMinistry={latestMinistry} />
      </div>
    </div>
  );
}
