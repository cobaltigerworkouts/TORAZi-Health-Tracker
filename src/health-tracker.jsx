import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Calendar, Activity, Utensils, Scale, PieChart, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'torazi_vital_data_v1';

// Googleスプレッドシートへのリアルタイム自動送信用Webhook (Google Apps Script)
const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyagmRzfT2OwDb5cOiPOQNRgjFOhqHmulOIwo-slDoESzGsLy5Jd4o1vNaDP8XLmYOqGQ/exec"; 

const sendToGoogleSheet = async (category, payload) => {
  if (!GOOGLE_SHEET_WEBHOOK_URL) return;
  try {
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category, payload }),
    });
  } catch (error) {
    console.error("Error sending to Google Sheet:", error);
  }
};

export default function HealthTracker() {
  const [activeTab, setActiveTab] = useState('training');
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
    return {
      workouts: [],
      intakes: [],
      metrics: []
    };
  });

  // フォーム用ステート
  const [workoutForm, setWorkoutForm] = useState({ date: new Date().toISOString().split('T')[0], type: '', duration: '', intensity: 'Normal', note: '' });
  const [intakeForm, setIntakeForm] = useState({ date: new Date().toISOString().split('T')[0], mealType: 'Breakfast', item: '', calories: '', protein: '' });
  const [metricForm, setMetricForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', condition: 'Good' });

  // データ保存処理（画面更新・ローカル保存・GAS送信を一体化）
  const addItem = useCallback((category, item) => {
    setData(prev => {
      const next = { ...prev, [category]: [...(prev[category] || []), item] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    // 画面やローカル保存に影響を与えない安全なGAS送信
    try {
      if (typeof sendToGoogleSheet === 'function') {
        sendToGoogleSheet(category, item);
      }
    } catch (e) {
      console.error("スプレッドシート送信エラー:", e);
    }
  }, []);

  // データ削除処理
  const removeItem = useCallback((category, id) => {
    setData(prev => {
      const next = { ...prev, [category]: (prev[category] || []).filter(item => item.id !== id) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleWorkoutSubmit = (e) => {
    e.preventDefault();
    if (!workoutForm.type) return;
    addItem('workouts', { ...workoutForm, id: Date.now() });
    setWorkoutForm({ date: new Date().toISOString().split('T')[0], type: '', duration: '', intensity: 'Normal', note: '' });
  };

  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    if (!intakeForm.item) return;
    addItem('intakes', { ...intakeForm, id: Date.now() });
    setIntakeForm({ date: new Date().toISOString().split('T')[0], mealType: 'Breakfast', item: '', calories: '', protein: '' });
  };

  const handleMetricSubmit = (e) => {
    e.preventDefault();
    if (!metricForm.weight) return;
    addItem('metrics', { ...metricForm, id: Date.now() });
    setMetricForm({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', condition: 'Good' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-emerald-400 flex items-center gap-2">
            <Activity className="h-6 w-6" /> TORAZi Vital Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">Health & Fitness Tracking System</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('training')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'training' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="h-4 w-4" /> Training
          </button>
          <button
            onClick={() => setActiveTab('intakes')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'intakes' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Utensils className="h-4 w-4" /> Intakes
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'metrics' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Scale className="h-4 w-4" /> Metrics
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'overview' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <PieChart className="h-4 w-4" /> Overview
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'training' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleWorkoutSubmit} className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-semibold text-emerald-400 mb-2">Log Workout</h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date</label>
                <input type="date" value={workoutForm.date} onChange={e => setWorkoutForm({...workoutForm, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type / Exercise</label>
                <input type="text" placeholder="e.g. Bench Press, Running" value={workoutForm.type} onChange={e => setWorkoutForm({...workoutForm, type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Duration (min)</label>
                  <input type="number" placeholder="45" value={workoutForm.duration} onChange={e => setWorkoutForm({...workoutForm, duration: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Intensity</label>
                  <select value={workoutForm.intensity} onChange={e => setWorkoutForm({...workoutForm, intensity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                    <option>Light</option>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Max</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Note</label>
                <input type="text" placeholder="Sets, reps, or feeling" value={workoutForm.note} onChange={e => setWorkoutForm({...workoutForm, note: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus className="h-4 w-4" /> Add Workout
              </button>
            </form>

            <div className="md:col-span-2 bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="text-lg font-semibold text-slate-200 mb-4">Workout Logs</h2>
              {data.workouts.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No workouts recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.workouts.slice().reverse().map(item => (
                    <div key={item.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{item.date}</span>
                          <span className="text-sm font-medium text-emerald-400">{item.type}</span>
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{item.intensity}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.duration ? `${item.duration} min` : ''} {item.note ? `| ${item.note}` : ''}</p>
                      </div>
                      <button onClick={() => removeItem('workouts', item.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'intakes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleIntakeSubmit} className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-semibold text-emerald-400 mb-2">Log Intake</h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date</label>
                <input type="date" value={intakeForm.date} onChange={e => setIntakeForm({...intakeForm, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Timing / Type</label>
                <select value={intakeForm.mealType} onChange={e => setIntakeForm({...intakeForm, mealType: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                  <option>Supplement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Item Name</label>
                <input type="text" placeholder="e.g. Chicken breast, Whey protein" value={intakeForm.item} onChange={e => setIntakeForm({...intakeForm, item: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Calories (kcal)</label>
                  <input type="number" placeholder="450" value={intakeForm.calories} onChange={e => setIntakeForm({...intakeForm, calories: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Protein (g)</label>
                  <input type="number" placeholder="30" value={intakeForm.protein} onChange={e => setIntakeForm({...intakeForm, protein: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus className="h-4 w-4" /> Add Intake
              </button>
            </form>

            <div className="md:col-span-2 bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="text-lg font-semibold text-slate-200 mb-4">Intake Logs</h2>
              {data.intakes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No nutrition logs recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.intakes.slice().reverse().map(item => (
                    <div key={item.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{item.date}</span>
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{item.mealType}</span>
                          <span className="text-sm font-medium text-emerald-400">{item.item}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.calories ? `${item.calories} kcal` : ''} {item.protein ? `| Protein: ${item.protein}g` : ''}</p>
                      </div>
                      <button onClick={() => removeItem('intakes', item.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleMetricSubmit} className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-semibold text-emerald-400 mb-2">Log Body Metrics</h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date</label>
                <input type="date" value={metricForm.date} onChange={e => setMetricForm({...metricForm, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" placeholder="70.5" value={metricForm.weight} onChange={e => setMetricForm({...metricForm, weight: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Body Fat (%)</label>
                  <input type="number" step="0.1" placeholder="15.0" value={metricForm.bodyFat} onChange={e => setMetricForm({...metricForm, bodyFat: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Condition</label>
                <select value={metricForm.condition} onChange={e => setMetricForm({...metricForm, condition: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                  <option>Great</option>
                  <option>Good</option>
                  <option>Tired</option>
                  <option>Poor</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus className="h-4 w-4" /> Add Metric
              </button>
            </form>

            <div className="md:col-span-2 bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="text-lg font-semibold text-slate-200 mb-4">Metric Logs</h2>
              {data.metrics.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No body metrics recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.metrics.slice().reverse().map(item => (
                    <div key={item.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{item.date}</span>
                          <span className="text-sm font-medium text-emerald-400">{item.weight} kg</span>
                          {item.bodyFat && <span className="text-xs text-slate-300">({item.bodyFat}%)</span>}
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{item.condition}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem('metrics', item.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-semibold text-emerald-400">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400">Total Workouts</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{data.workouts.length}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400">Total Intake Logs</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{data.intakes.length}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400">Weight Logs</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{data.metrics.length}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
