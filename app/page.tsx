'use client';

import { useState, useEffect } from 'react';
import MonitoringForm from '@/components/MonitoringForm';
import SubmissionHistory from '@/components/SubmissionHistory';
import AdminView from '@/components/AdminView';
import { ADMIN_KEY } from '@/lib/adminAuth';

type View = 'login' | 'form' | 'history' | 'admin' | 'adminEdit';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [editSubmissionId, setEditSubmissionId] = useState<string | null>(null);
  const [adminEditId, setAdminEditId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved && saved !== ADMIN_KEY) {
      setUserName(saved);
      setCurrentView('form');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) return;

    if (trimmed === ADMIN_KEY) {
      setUserName(trimmed);
      setCurrentView('admin');
      return;
    }

    localStorage.setItem('currentUser', trimmed);
    setUserName(trimmed);
    setCurrentView('form');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUserName('');
    setInputName('');
    setEditSubmissionId(null);
    setAdminEditId(null);
    setCurrentView('login');
  };

  const goToNewEntry = () => {
    setEditSubmissionId(null);
    setCurrentView('form');
  };

  const handleEdit = (id: string) => {
    setEditSubmissionId(id);
    setCurrentView('form');
  };

  const handleAdminEdit = (id: string) => {
    setAdminEditId(id);
    setCurrentView('adminEdit');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 max-w-6xl">
        <header className="mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Music Ministry Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Christian Bible Baptist Church - Los Baños
          </p>
        </header>

        {currentView === 'login' ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
              Welcome
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Enter Your Name
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Continue
              </button>
            </form>
          </div>
        ) : currentView === 'admin' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Admin View</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Exit
              </button>
            </div>
            <AdminView onEdit={handleAdminEdit} />
          </div>
        ) : currentView === 'adminEdit' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                Admin View — Editing Entry
              </p>
              <button
                onClick={() => {
                  setAdminEditId(null);
                  setCurrentView('admin');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Back to Admin
              </button>
            </div>
            <MonitoringForm
              key={adminEditId}
              userName=""
              editSubmissionId={adminEditId}
              onSubmitSuccess={() => {
                setAdminEditId(null);
                setCurrentView('admin');
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{userName}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => (currentView === 'form' ? setCurrentView('history') : goToNewEntry())}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {currentView === 'form' ? 'View History' : 'New Entry'}
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>

            {currentView === 'form' ? (
              <MonitoringForm
                key={editSubmissionId ?? 'new'}
                userName={userName}
                editSubmissionId={editSubmissionId}
                onSubmitSuccess={() => {
                  setEditSubmissionId(null);
                  setCurrentView('history');
                }}
              />
            ) : (
              <SubmissionHistory userName={userName} onEdit={handleEdit} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
