'use client';

import { useState, useEffect } from 'react';
import {
  attendanceItems,
  practicesItems,
  performancesItems,
  ministryRequirementsItems,
  personalWalkItems,
} from '@/lib/formConfig';

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
  personalWalk: Record<string, string>;
}

interface MonitoringFormProps {
  userName: string;
  onSubmitSuccess: () => void;
  editSubmissionId?: string | null;
}

function emptyForm(userName: string): FormData {
  return {
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
  };
}

export default function MonitoringForm({ userName, onSubmitSuccess, editSubmissionId }: MonitoringFormProps) {
  const [formData, setFormData] = useState<FormData>(emptyForm(userName));
  const [activeEditId, setActiveEditId] = useState<string | null>(editSubmissionId ?? null);
  const [initializing, setInitializing] = useState(!!editSubmissionId);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [duplicate, setDuplicate] = useState<{ id: string; message: string } | null>(null);

  const populateFrom = (data: any) => {
    setFormData({
      name: data.name,
      voice: data.voice || '',
      bibleVerse: data.bibleVerse || '',
      week: data.week,
      ministry: data.ministry,
      attendance: data.attendance || {},
      practices: data.practices || {},
      performances: data.performances || {},
      ministryRequirements: data.ministryRequirements || {},
      personalWalk: data.personalWalk || {},
    });
  };

  useEffect(() => {
    if (!editSubmissionId) return;
    let cancelled = false;
    fetch(`/api/submissions/${editSubmissionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) populateFrom(data);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleCancelEdit = () => {
    setActiveEditId(null);
    setFormData(emptyForm(userName));
    setMessage('');
    setDuplicate(null);
  };

  const handleEditExisting = async () => {
    if (!duplicate) return;
    const id = duplicate.id;
    setDuplicate(null);
    setInitializing(true);
    try {
      const res = await fetch(`/api/submissions/${id}`);
      const data = await res.json();
      populateFrom(data);
      setActiveEditId(id);
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setDuplicate(null);

    try {
      const url = activeEditId ? `/api/submissions/${activeEditId}` : '/api/submissions';
      const method = activeEditId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('✓ Submission saved successfully!');
        setTimeout(() => {
          onSubmitSuccess();
        }, 1200);
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (response.status === 409 && data.existingId) {
        setDuplicate({ id: data.existingId, message: data.message });
      } else {
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

  if (initializing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading entry...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-8">
      {activeEditId && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-slate-700 text-blue-800 dark:text-blue-100 px-4 py-2 rounded-lg text-sm">
          <span>Editing entry for week of {new Date(formData.week).toLocaleDateString()}</span>
          <button type="button" onClick={handleCancelEdit} className="underline font-medium">
            Cancel &amp; start new entry
          </button>
        </div>
      )}

      {duplicate && (
        <div className="p-4 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 space-y-3">
          <p>{duplicate.message}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleEditExisting}
              className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg"
            >
              Edit Existing Entry
            </button>
            <button
              type="button"
              onClick={() => setDuplicate(null)}
              className="text-sm text-amber-800 dark:text-amber-200 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
            disabled={!!activeEditId}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white ${
              activeEditId ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            required
          />
          {activeEditId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Week can&apos;t be changed while editing an existing entry.
            </p>
          )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalWalkItems.map((item) => (
            <div key={item}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {item}
              </label>
              <input
                type="number"
                value={formData.personalWalk[item] || ''}
                onChange={(e) => handleCheckboxChange('personalWalk', item, e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
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
        {loading ? 'Submitting...' : activeEditId ? 'Save Changes' : 'Submit Weekly Report'}
      </button>
    </form>
  );
}
