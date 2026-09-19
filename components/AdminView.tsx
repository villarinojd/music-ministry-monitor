'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Submission } from '@/lib/db';
import { ADMIN_KEY } from '@/lib/adminAuth';
import SubmissionsTable from './SubmissionsTable';

interface AdminViewProps {
  onEdit: (id: string) => void;
}

type MergeStep = 'closed' | 'target' | 'conflicts';

export default function AdminView({ onEdit }: AdminViewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openNames, setOpenNames] = useState<Set<string>>(new Set());

  const [mergeSelection, setMergeSelection] = useState<Set<string>>(new Set());
  const [mergeStep, setMergeStep] = useState<MergeStep>('closed');
  const [mergeTargetName, setMergeTargetName] = useState('');
  const [mergeConflicts, setMergeConflicts] = useState<Record<string, Submission[]>>({});
  const [mergeResolutions, setMergeResolutions] = useState<Record<string, string>>({});
  const [mergeError, setMergeError] = useState('');
  const [merging, setMerging] = useState(false);

  const refetch = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(`/api/submissions?adminKey=${encodeURIComponent(ADMIN_KEY)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((data) => setSubmissions(data.submissions || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const grouped = submissions.reduce<Record<string, Submission[]>>((acc, sub) => {
    (acc[sub.name] ??= []).push(sub);
    return acc;
  }, {});
  const names = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const toggle = (name: string) => {
    setOpenNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleMergeSelect = (name: string) => {
    setMergeSelection((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else if (next.size < 2) {
        next.add(name);
      }
      return next;
    });
  };

  const openMergeDialog = () => {
    const [first] = Array.from(mergeSelection);
    setMergeTargetName(first);
    setMergeStep('target');
    setMergeError('');
  };

  const closeMergeDialog = () => {
    setMergeStep('closed');
    setMergeSelection(new Set());
    setMergeConflicts({});
    setMergeResolutions({});
    setMergeTargetName('');
    setMergeError('');
  };

  const attemptMerge = async (resolutions?: Record<string, string>) => {
    setMerging(true);
    setMergeError('');
    try {
      const res = await fetch('/api/admin/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: ADMIN_KEY,
          names: Array.from(mergeSelection),
          targetName: mergeTargetName,
          conflictResolutions: resolutions || {},
        }),
      });
      const data = await res.json();

      if (res.status === 409 && data.conflicts) {
        setMergeConflicts(data.conflicts);
        setMergeStep('conflicts');
        return;
      }
      if (!res.ok) {
        setMergeError(data.error || 'Failed to merge');
        return;
      }

      closeMergeDialog();
      refetch();
    } catch (err) {
      setMergeError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setMerging(false);
    }
  };

  const confirmConflicts = () => {
    const allResolved = Object.keys(mergeConflicts).every((week) => mergeResolutions[week]);
    if (!allResolved) {
      setMergeError('Please choose an entry to keep for every conflicting week.');
      return;
    }
    attemptMerge(mergeResolutions);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading all submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          All Members ({names.length})
        </h2>
        <button
          type="button"
          onClick={openMergeDialog}
          disabled={mergeSelection.size !== 2}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Merge Selected ({mergeSelection.size}/2)
        </button>
      </div>

      {names.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400 text-sm">No submissions yet.</p>
      )}

      {names.map((name) => {
        const isOpen = openNames.has(name);
        return (
          <div key={name} className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
            <div className="flex items-center bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition">
              <label className="pl-4 py-3 flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeSelection.has(name)}
                  onChange={() => toggleMergeSelect(name)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <button
                type="button"
                onClick={() => toggle(name)}
                className="flex-1 flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-semibold text-gray-800 dark:text-white">{name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {grouped[name].length} {grouped[name].length === 1 ? 'entry' : 'entries'}{' '}
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
            </div>
            {isOpen && (
              <div className="p-4 border-t border-gray-200 dark:border-slate-600">
                <SubmissionsTable submissions={grouped[name]} onEdit={onEdit} />
              </div>
            )}
          </div>
        );
      })}

      {mergeStep !== 'closed' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {mergeStep === 'target' && (
              <>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Merge Members</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Merging {Array.from(mergeSelection).join(' and ')}. Choose the name to keep for
                  the merged folder:
                </p>
                <div className="space-y-2">
                  {Array.from(mergeSelection).map((name) => (
                    <label
                      key={name}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-200"
                    >
                      <input
                        type="radio"
                        name="mergeTarget"
                        checked={mergeTargetName === name}
                        onChange={() => setMergeTargetName(name)}
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
                {mergeError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{mergeError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeMergeDialog}
                    className="text-sm px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => attemptMerge()}
                    disabled={merging}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg disabled:opacity-50"
                  >
                    {merging ? 'Checking...' : 'Continue'}
                  </button>
                </div>
              </>
            )}

            {mergeStep === 'conflicts' && (
              <>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Resolve Conflicting Weeks
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Both members have an entry for the same week. Pick which entry to keep for each:
                </p>
                <div className="space-y-4">
                  {Object.entries(mergeConflicts).map(([week, subs]) => (
                    <div
                      key={week}
                      className="border border-gray-200 dark:border-slate-600 rounded-lg p-3"
                    >
                      <p className="font-semibold text-gray-800 dark:text-white text-sm mb-2">
                        Week of {new Date(week).toLocaleDateString()}
                      </p>
                      <div className="space-y-1">
                        {subs.map((sub) => (
                          <label
                            key={sub.id}
                            className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200"
                          >
                            <input
                              type="radio"
                              name={`conflict-${week}`}
                              checked={mergeResolutions[week] === sub.id}
                              onChange={() =>
                                setMergeResolutions((prev) => ({ ...prev, [week]: sub.id }))
                              }
                            />
                            <span>
                              {sub.name} — {sub.ministry} — submitted{' '}
                              {new Date(sub.submittedAt).toLocaleString()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {mergeError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{mergeError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeMergeDialog}
                    className="text-sm px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmConflicts}
                    disabled={merging}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg disabled:opacity-50"
                  >
                    {merging ? 'Merging...' : 'Confirm Merge'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
