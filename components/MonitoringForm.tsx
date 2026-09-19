'use client';

import { useState } from 'react';

interface FormData {
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
}

const attendanceItems = [
  'Sunday School',
  'AM Service',
  'Discipleship',
  'PM Service',
  'Divided Fellowship',
  'Doctrine Class',
  'Prayer Meeting',
  'Street Soulwinning',
  'Soulwinning/Visitation',
  'Sabbath Class',
];

const practicesItems = {
  choir: ['Sunday Practice', 'Wednesday Practice', 'Saturday Practice'],
  orchestra: ['Sunday Practice', 'Wednesday Practice', 'Friday Practice', 'Saturday Practice'],
};

const performancesItems = {
  choir: ['AM Song', 'PM Song', 'Wed Song'],
  orchestra: ['AM Song', 'AM Offertory', 'PM Song', 'PM Offertory', 'Wed Song', 'Wed Offertory'],
};

const ministryRequirementsItems = ['Uniform', 'Music Sheet', 'Memorized Song', 'Commitment'];

const personalWalkItems = [
  'Bible Reading (Chapters)',
  'No. of Souls Won',
  'No. of Tracts Distributed',
  'No. of Bible Studies',
  'No. of Good News Classes',
  'No. of Extension Classes',
  'No. of First Time Visitors',
  'Assisted FTV\'s (Baptism)',
  'Fetching/Ferrying',
  'Tithes',
  'Offering',
];

interface MonitoringFormProps {
  userName: string;
  onSubmitSuccess: () => void;
}

export default function MonitoringForm({ userName, onSubmitSuccess }: MonitoringFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: userName,
    voice: '',
    bibleVerse: '',
    week: new Date().toISOString().split('T')[0],
    ministry: 'choir',
    attendance: {},
    practices: {},
    performances: {},
    ministryRequirements: {},
    personalWalk: {},
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (category: string, item: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof FormData] as Record<string, string>),
        [item]: value,
      },
    }));
  };

  const handlePersonalWalkToggle = (item: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      personalWalk: { ...prev.personalWalk, [item]: checked },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('✓ Submission saved successfully!');
        setTimeout(() => {
          onSubmitSuccess();
        }, 1500);
      } else {
        const data = await response.json().catch(() => ({}));
        setMessage(`✗ ${data.error || `Error saving submission (status ${response.status})`}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`✗ Error submitting form: ${msg}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentPractices = practicesItems[formData.ministry];
  const currentPerformances = performancesItems[formData.ministry];

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Voice/Instrument
          </label>
          <input
            type="text"
            value={formData.voice}
            onChange={(e) => handleInputChange('voice', e.target.value)}
            placeholder="e.g., Soprano, Violin"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Bible Verse
          </label>
          <input
            type="text"
            value={formData.bibleVerse}
            onChange={(e) => handleInputChange('bibleVerse', e.target.value)}
            placeholder="Your Bible verse for the week"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Week Starting
          </label>
          <input
            type="date"
            value={formData.week}
            onChange={(e) => handleInputChange('week', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Ministry
          </label>
          <select
            value={formData.ministry}
            onChange={(e) => handleInputChange('ministry', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="choir">Choir</option>
            <option value="orchestra">Orchestra</option>
          </select>
        </div>
      </div>

      {/* Attendance Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
          Attendance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {attendanceItems.map((item) => (
            <label key={item} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <select
                value={formData.attendance[item] || ''}
                onChange={(e) => handleCheckboxChange('attendance', item, e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
              >
                <option value="">-</option>
                <option value="✓">✓ Present</option>
                <option value="X">X Absent</option>
                <option value="L">L Late</option>
              </select>
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Practices Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
          Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentPractices.map((item) => (
            <label key={item} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <select
                value={formData.practices[item] || ''}
                onChange={(e) => handleCheckboxChange('practices', item, e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
              >
                <option value="">-</option>
                <option value="✓">✓ Present</option>
                <option value="X">X Absent</option>
                <option value="L">L Late</option>
              </select>
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Performances Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
          Performances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentPerformances.map((item) => (
            <label key={item} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <select
                value={formData.performances[item] || ''}
                onChange={(e) => handleCheckboxChange('performances', item, e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
              >
                <option value="">-</option>
                <option value="✓">✓ Performed</option>
                <option value="X">X Did Not Perform</option>
              </select>
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ministry Requirements Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
          Ministry Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ministryRequirementsItems.map((item) => (
            <label key={item} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <select
                value={formData.ministryRequirements[item] || ''}
                onChange={(e) => handleCheckboxChange('ministryRequirements', item, e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
              >
                <option value="">-</option>
                <option value="✓">✓ Completed</option>
                <option value="X">X Not Completed</option>
              </select>
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Personal Walk Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
          Personal Walk
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {personalWalkItems.map((item) => (
            <label key={item} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={formData.personalWalk[item] || false}
                onChange={(e) => handlePersonalWalkToggle(item, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✓') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Weekly Report'}
      </button>
    </form>
  );
}
