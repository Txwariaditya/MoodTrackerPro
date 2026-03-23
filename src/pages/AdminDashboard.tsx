import { useState, useEffect } from "react";
import { 
  Users, Database, Trash2, ShieldAlert, 
  ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const [moods, setMoods] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    uniqueUsers: 1, // Mocked for now
    avgMood: 0,
    growth: 12
  });

  const fetchAllData = async () => {
    try {
      const res = await fetch("/api/moods");
      const data = await res.json();
      setMoods(data);
      
      const avg = data.reduce((acc: number, curr: any) => {
        const val = { happy: 5, excited: 4, calm: 3, anxious: 2, sad: 1 }[curr.mood.toLowerCase()] || 3;
        return acc + val;
      }, 0) / (data.length || 1);

      setStats(prev => ({
        ...prev,
        totalLogs: data.length,
        avgMood: Number(avg.toFixed(1))
      }));
    } catch (error) {
      console.error("Admin fetch error", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const clearAll = async () => {
    if (!confirm("Are you sure you want to wipe ALL data? This cannot be undone.")) return;
    try {
      await fetch("/api/moods", { method: "DELETE" });
      fetchAllData();
    } catch (error) {
      console.error("Clear error", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Control Center</h2>
          <p className="text-slate-500">Monitor system health and user activity</p>
        </div>
        <button 
          onClick={clearAll}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"
        >
          <Trash2 className="w-4 h-4" />
          Purge Database
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Logs", value: stats.totalLogs, icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Users", value: stats.uniqueUsers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Avg Mood Score", value: stats.avgMood, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "System Health", value: "99.9%", icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {stats.growth}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Master Audit Log</h3>
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {moods.length} Entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Mood</th>
                <th className="px-6 py-4 font-semibold">Thoughts</th>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {moods.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono">#{m.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold">
                        U
                      </div>
                      <span className="font-medium">User_01</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${
                      m.mood.toLowerCase() === 'happy' ? 'bg-green-100 text-green-700' :
                      m.mood.toLowerCase() === 'sad' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {m.mood}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {m.thoughts || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-slate-600">Synced</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
