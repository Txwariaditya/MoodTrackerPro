import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell 
} from "recharts";
import { Smile, Frown, AlertCircle, Zap, Coffee, Trash2, Send, BrainCircuit } from "lucide-react";
import { motion } from "motion/react";

const MOOD_OPTIONS = [
  { id: "happy", label: "Happy", icon: Smile, color: "#22c55e", bg: "bg-green-100", text: "text-green-600", value: 5 },
  { id: "excited", label: "Excited", icon: Zap, color: "#a855f7", bg: "bg-purple-100", text: "text-purple-600", value: 4 },
  { id: "calm", label: "Calm", icon: Coffee, color: "#14b8a6", bg: "bg-teal-100", text: "text-teal-600", value: 3 },
  { id: "anxious", label: "Anxious", icon: AlertCircle, color: "#f97316", bg: "bg-orange-100", text: "text-orange-600", value: 2 },
  { id: "sad", label: "Sad", icon: Frown, color: "#3b82f6", bg: "bg-blue-100", text: "text-blue-600", value: 1 },
];

export default function UserDashboard() {
  const [moods, setMoods] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMoods = async () => {
    try {
      const res = await fetch("/api/moods");
      const data = await res.json();
      setMoods(data);
    } catch (error) {
      console.error("Failed to fetch moods", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    try {
      await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood, thoughts }),
      });
      setSelectedMood("");
      setThoughts("");
      fetchMoods();
    } catch (error) {
      console.error("Failed to add mood", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/moods/${id}`, { method: "DELETE" });
      fetchMoods();
    } catch (error) {
      console.error("Failed to delete mood", error);
    }
  };

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    return last7Days.map(date => {
      const dayMoods = moods.filter(m => m.created_at.startsWith(date));
      const entry: any = { date };
      MOOD_OPTIONS.forEach(opt => {
        entry[opt.id] = dayMoods.filter(m => m.mood.toLowerCase() === opt.id).length;
      });
      return entry;
    });
  };

  const getLineData = () => {
    return [...moods].reverse().map(m => ({
      time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: MOOD_OPTIONS.find(o => o.id === m.mood.toLowerCase())?.value || 3
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Form & History */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Smile className="text-indigo-600 w-5 h-5" />
            How are you feeling?
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedMood(opt.id)}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all border-2 ${
                      selectedMood === opt.id 
                        ? `border-indigo-600 ${opt.bg}` 
                        : "border-transparent bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${selectedMood === opt.id ? opt.text : "text-slate-400"}`} />
                    <span className="text-[10px] mt-1 font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <textarea
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-24"
            />
            <button
              type="submit"
              disabled={!selectedMood}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Log Mood
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BrainCircuit className="text-indigo-600 w-5 h-5" />
            AI Insight
          </h2>
          <div className="p-4 bg-indigo-50 rounded-xl text-sm text-indigo-900 leading-relaxed">
            {moods.length > 0 ? (
              <p>
                Based on your recent logs, you've been feeling <strong>{moods[0].mood}</strong>. 
                Try to maintain this positive momentum by taking a 10-minute walk today!
              </p>
            ) : (
              <p>Log your first mood to get personalized AI insights and tips.</p>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent History</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {moods.map((m) => {
              const opt = MOOD_OPTIONS.find(o => o.id === m.mood.toLowerCase());
              const Icon = opt?.icon || Smile;
              return (
                <div key={m.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl group">
                  <div className={`p-2 rounded-lg ${opt?.bg || "bg-slate-200"}`}>
                    <Icon className={`w-5 h-5 ${opt?.text || "text-slate-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm capitalize">{m.mood}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{m.thoughts}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(m.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {moods.length === 0 && !loading && (
              <p className="text-center text-slate-400 text-sm py-10">No logs yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Charts */}
      <div className="lg:col-span-8 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Weekly Distribution</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                {MOOD_OPTIONS.map(opt => (
                  <Bar key={opt.id} dataKey={opt.id} stackId="a" fill={opt.color} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Mood Progression</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getLineData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(v) => MOOD_OPTIONS.find(o => o.value === v)?.label || ""}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
