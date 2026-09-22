import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Key, X, Check, ExternalLink, Zap } from 'lucide-react';
import { CheckinForm } from './components/CheckinForm';
import { CoachResult } from './components/CoachResult';
import { CheckinRequest, CoachResponse, HealthStatus } from './types';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CoachResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OpenRouter Client Configuration (targeting openrouter/free route)
  const [openrouterKey, setOpenrouterKey] = useState<string>(() => {
    return localStorage.getItem('apex_openrouter_key') || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>(openrouterKey);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get<HealthStatus>('/api/health');
        setHealth(response.data);
      } catch (err) {
        console.warn('Backend not responding to health check:', err);
      }
    };
    checkHealth();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempKey.trim();
    setOpenrouterKey(cleanKey);
    localStorage.setItem('apex_openrouter_key', cleanKey);
    setIsSettingsOpen(false);
  };

  const handleFormSubmit = async (data: CheckinRequest) => {
    const hasKey = Boolean(openrouterKey) || Boolean(health?.openrouter_configured);
    if (!hasKey) {
      setIsSettingsOpen(true);
      setErrorMessage('Please provide your OpenRouter API key to activate the live LangGraph agent.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const payload: CheckinRequest = {
      ...data,
      openrouter_api_key: openrouterKey?.trim().startsWith('sk-or-') ? openrouterKey.trim() : null,
      openrouter_model: 'openrouter/free',
    };

    try {
      const response = await axios.post<CoachResponse>('/api/checkin', payload);
      setResult(response.data);
    } catch (err: unknown) {
      console.error('Error submitting checkin:', err);
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.detail || err.message || 'Failed to communicate with coach service.'
        );
      } else {
        setErrorMessage('An unexpected error occurred while communicating with the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMessage(null);
  };

  const hasConfiguredKey = Boolean(openrouterKey) || Boolean(health?.openrouter_configured);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold tracking-tight text-lg text-slate-900">
                Apex
              </span>
              <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-2 hidden sm:inline">
                Precision Performance Architecture
              </span>
            </div>
          </div>

          {/* Right controls: OpenRouter key configuration */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
                }`}
              ></span>
              <span>AI Engine Active</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setTempKey(openrouterKey);
                setIsSettingsOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                hasConfiguredKey
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{hasConfiguredKey ? 'API Key Configured' : 'Connect API Key'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header matching Cinetik design */}
      {!result && (
        <section className="pt-10 pb-6 px-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase mb-4 shadow-subtle">
            <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>Precision Health & Nutrition Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Plan clearly. Anticipate{' '}
            <span className="text-blue-600">your performance.</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Apex structures daily physical training by fatigue state, calculates exact macro requirements, and creates high-protein recipes directly from your pantry.
          </p>
        </section>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 pb-12">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 shadow-subtle">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Notification</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-card p-6 sm:p-10">
          {result ? (
            <CoachResult result={result} onReset={handleReset} />
          ) : (
            <CheckinForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-modal p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">API Key Configuration</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    OpenRouter API Key
                  </label>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <p className="text-[11px] text-slate-500">
                  Key is saved in your browser or automatically detected from backend/.env.
                </p>
              </div>

              {/* Dynamic openrouter/free route badge */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold">Routing Endpoint:</span>
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-medium bg-blue-50 border border-blue-200 text-blue-700">
                    openrouter/free
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans pt-1">
                  Automatically balances and routes calls to active free models without capacity or deprecation errors.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-subtle"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Apex · Precision Performance Architecture</span>
          <span className="text-slate-400">LangGraph Multi-Agent Engine</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
