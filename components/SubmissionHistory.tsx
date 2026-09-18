'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: string;
  name: string;
  week: string;
  ministry: string;
  voice: string;
  bibleVerse: string;
  submittedAt: string;
}

interface SubmissionHistoryProps {
  userName: string;
}

export default function SubmissionHistory({ userName }: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [fullData, setFullData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [userName]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/submissions?userName=${encodeURIComponent(userName)}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (submissionId: string) => {
    if (selectedSubmission === submissionId) {
      setSelectedSubmission(null);
      setFullData(null);
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${submissionId}`);
      if (response.ok) {
        const data = await response.json();
        setFullData(data);
        setSelectedSubmission(submissionId);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading submissions...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No submissions yet for {userName}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Submit a weekly report to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Submission History ({submissions.length})
      </h2>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white">
                  Week
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white">
                  Ministry
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr
                  key={submission.id}
                  className={`border-b border-gray-200 dark:border-slate-600 ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-slate-800'
                      : 'bg-gray-50 dark:bg-slate-700'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                    {new Date(submission.week).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 capitalize">
                    {submission.ministry}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(submission.submittedAt).toLocaleDateString()}{' '}
                    {new Date(submission.submittedAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleViewDetails(submission.id)}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                    >
                      {selectedSubmission === submission.id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && fullData && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Details for Week of {new Date(fullData.week).toLocaleDateString()}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Name</p>
                <p>{fullData.name}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Ministry</p>
                <p className="capitalize">{fullData.ministry}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Voice/Instrument</p>
                <p>{fullData.voice || 'Not specified'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Bible Verse</p>
                <p>{fullData.bibleVerse || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {Object.entries(fullData)
            .filter(
              ([key]) =>
                key !== 'id' &&
                key !== 'name' &&
                key !== 'voice' &&
                key !== 'bibleVerse' &&
                key !== 'week' &&
                key !== 'ministry' &&
                key !== 'submittedAt'
            )
            .map(([category, items]) => (
              <div key={category} className="border-b pb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {typeof items === 'object' && items !== null ? (
                    Object.entries(items).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-slate-700 p-3 rounded">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{key}</p>
                        <p className="text-gray-800 dark:text-white font-semibold">
                          {value ? String(value) : '—'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 md:col-span-3 text-gray-600 dark:text-gray-400">
                      No data
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
