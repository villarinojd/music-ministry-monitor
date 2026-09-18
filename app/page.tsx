'use client';

import { useState, useEffect } from 'react';
import MonitoringForm from '@/components/MonitoringForm';
import SubmissionHistory from '@/components/SubmissionHistory';

type View = 'login' | 'form' | 'history';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setUserName(saved);
      setCurrentView('form');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      localStorage.setItem('currentUser', inputName);
      setUserName(inputName);
      setCurrentView('form');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUserName('');
    setInputName('');
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 max-w-4xl">
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
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{userName}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentView(currentView === 'form' ? 'history' : 'form')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {currentView === 'form' ? 'View History' : 'Back to Form'}
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
              <MonitoringForm userName={userName} onSubmitSuccess={() => setCurrentView('history')} />
            ) : (
              <SubmissionHistory userName={userName} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
