'use client';

import { Fragment } from 'react';
import type { Submission } from '@/lib/db';
import {
  attendanceItems,
  allPracticesItems,
  allPerformancesItems,
  ministryRequirementsItems,
  personalWalkItems,
} from '@/lib/formConfig';

interface SubmissionsTableProps {
  submissions: Submission[];
  onEdit?: (id: string) => void;
}

const sections: { title: string; key: keyof Submission; items: string[] }[] = [
  { title: 'Attendance', key: 'attendance', items: attendanceItems },
  { title: 'Practices', key: 'practices', items: allPracticesItems },
  { title: 'Performances', key: 'performances', items: allPerformancesItems },
  { title: 'Ministry Requirements', key: 'ministryRequirements', items: ministryRequirementsItems },
  { title: 'Personal Walk', key: 'personalWalk', items: personalWalkItems },
];

export default function SubmissionsTable({ submissions, onEdit }: SubmissionsTableProps) {
  const sorted = [...submissions].sort(
    (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
  );

  if (sorted.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400 text-sm">No submissions yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-gray-100 dark:bg-slate-700 text-left px-3 py-2 border border-gray-200 dark:border-slate-600">
              Item
            </th>
            {sorted.map((sub) => (
              <th
                key={sub.id}
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 text-center bg-gray-100 dark:bg-slate-700 whitespace-nowrap"
              >
                <div className="font-semibold text-gray-800 dark:text-white">
                  {new Date(sub.week).toLocaleDateString()}
                </div>
                <div className="text-xs font-normal text-gray-500 dark:text-gray-400 capitalize">
                  {sub.ministry}
                </div>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(sub.id)}
                    className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-normal"
                  >
                    Edit
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="sticky left-0 bg-white dark:bg-slate-800 px-3 py-2 border border-gray-200 dark:border-slate-600 font-medium">
              Voice/Instrument
            </td>
            {sorted.map((sub) => (
              <td key={sub.id} className="px-3 py-2 border border-gray-200 dark:border-slate-600 text-center">
                {sub.voice || '—'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="sticky left-0 bg-white dark:bg-slate-800 px-3 py-2 border border-gray-200 dark:border-slate-600 font-medium">
              Bible Verse
            </td>
            {sorted.map((sub) => (
              <td key={sub.id} className="px-3 py-2 border border-gray-200 dark:border-slate-600 text-center">
                {sub.bibleVerse || '—'}
              </td>
            ))}
          </tr>

          {sections.map((section) => (
            <Fragment key={section.key as string}>
              <tr>
                <td
                  colSpan={sorted.length + 1}
                  className="bg-indigo-50 dark:bg-slate-700 px-3 py-1.5 border border-gray-200 dark:border-slate-600 font-semibold text-gray-800 dark:text-white"
                >
                  {section.title}
                </td>
              </tr>
              {section.items.map((item) => (
                <tr key={`${section.key}-${item}`}>
                  <td className="sticky left-0 bg-white dark:bg-slate-800 px-3 py-2 border border-gray-200 dark:border-slate-600">
                    {item}
                  </td>
                  {sorted.map((sub) => {
                    const value = (sub[section.key] as Record<string, string> | undefined)?.[item];
                    return (
                      <td
                        key={sub.id}
                        className="px-3 py-2 border border-gray-200 dark:border-slate-600 text-center"
                      >
                        {value || '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
