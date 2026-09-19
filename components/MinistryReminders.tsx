'use client';

import { useState } from 'react';
import {
  ministryReminders,
  practiceRules,
  responsibilities,
  termsOfSuspension,
  termsOfSuspensionIntro,
} from '@/lib/reminders';

interface MinistryRemindersProps {
  defaultMinistry?: 'choir' | 'orchestra';
}

function ReminderList({ title, items, intro }: { title: string; items: string[]; intro?: string }) {
  return (
    <div>
      <h4 className="font-semibold text-gray-800 dark:text-white mb-2 text-sm uppercase tracking-wide">
        {title}
      </h4>
      {intro && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{intro}</p>}
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

export default function MinistryReminders({ defaultMinistry = 'choir' }: MinistryRemindersProps) {
  const [ministry, setMinistry] = useState<'choir' | 'orchestra'>(defaultMinistry);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Reminders</h3>
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 text-sm">
          <button
            type="button"
            onClick={() => setMinistry('choir')}
            className={`px-3 py-1 ${
              ministry === 'choir'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            Choir
          </button>
          <button
            type="button"
            onClick={() => setMinistry('orchestra')}
            className={`px-3 py-1 ${
              ministry === 'orchestra'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            Orchestra
          </button>
        </div>
      </div>

      <ReminderList title="Ministry Reminders" items={ministryReminders} />
      <ReminderList title="Practice Rules" items={practiceRules[ministry]} />
      <ReminderList title="Responsibilities and Obligations" items={responsibilities[ministry]} />
      <ReminderList
        title="Terms of Suspension"
        items={termsOfSuspension[ministry]}
        intro={termsOfSuspensionIntro}
      />
    </div>
  );
}
