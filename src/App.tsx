/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Trophy, ShieldAlert, Scale, Zap, BrainCircuit, Activity, Target, Shield, Info, BookOpen, Calculator, CheckCircle2, TerminalSquare, Gauge, ChevronDown, ChevronUp, Radar as RadarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type RankingMode = 'performance' | 'fairness' | 'honest';

interface ModelStat {
  id: string;
  model: string;
  runs: number;
  score: number;
  success_rate: number;
  integrity: number;
  efficiency: number;
  honesty: number;
  exploit_rate: number;
  meta_exploit_rate: number;
  variance: number;
  flags: string[];
  insight: string;
  full_insight: string;
}

const getColor = (val: number, type: 'good-high' | 'good-low' | 'neutral' = 'good-high') => {
  if (type === 'good-high') {
    if (val >= 0.8) return 'text-emerald-400';
    if (val >= 0.5) return 'text-amber-400';
    return 'text-rose-400';
  }
  if (type === 'good-low') {
    if (val <= 0.2) return 'text-emerald-400';
    if (val <= 0.5) return 'text-amber-400';
    return 'text-rose-400';
  }
  // For integrity (can be negative)
  if (val > 0) return 'text-emerald-400';
  if (val > -1) return 'text-amber-400';
  return 'text-rose-400';
};

const PALETTE = [
  '#818cf8', // indigo-400
  '#fb7185', // rose-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#a78bfa', // violet-400
  '#2dd4bf', // teal-400
  '#f472b6', // pink-400
  '#38bdf8', // sky-400
];

export default function App() {
  const [mode, setMode] = useState<RankingMode>('performance');
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [selectedRadarModels, setSelectedRadarModels] = useState<string[]>([]);
  const [data, setData] = useState<ModelStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://gist.githubusercontent.com/zaebee/53515a5371be237b81c52fe8fae04713/raw/c3afe10de36a1e2d6848713eced1a22d52400f4f/leaderboard.json')
      .then(r => r.json())
      .then(fetchedData => {
        setData(fetchedData);
        if (fetchedData.length > 0) {
          setSelectedRadarModels(fetchedData.slice(0, 2).map((m: ModelStat) => m.id));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard data:", err);
        setLoading(false);
      });
  }, []);

  const modelColors = useMemo(() => {
    const colors: Record<string, string> = {};
    data.forEach((stat, idx) => {
      colors[stat.id] = PALETTE[idx % PALETTE.length];
    });
    return colors;
  }, [data]);

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (mode === 'performance') {
        return b.score - a.score;
      } else if (mode === 'fairness') {
        const penaltyA = (a.exploit_rate + a.meta_exploit_rate) * 2;
        const penaltyB = (b.exploit_rate + b.meta_exploit_rate) * 2;
        return (b.score - penaltyB) - (a.score - penaltyA);
      } else if (mode === 'honest') {
        return (b.honesty * b.success_rate) - (a.honesty * a.success_rate);
      }
      return 0;
    });
  }, [mode, data]);

  const radarData = useMemo(() => {
    const metrics = [
      { key: 'success_rate', label: 'Success' },
      { key: 'honesty', label: 'Honesty' },
      { key: 'efficiency', label: 'Efficiency' },
      { key: 'safety', label: 'Safety (No Exploit)' },
      { key: 'rules', label: 'Rules (No Meta)' },
      { key: 'integrity_norm', label: 'Integrity' }
    ];

    return metrics.map(m => {
      const row: any = { subject: m.label };
      data.forEach(stat => {
        if (m.key === 'safety') row[stat.id] = (1 - stat.exploit_rate) * 100;
        else if (m.key === 'rules') row[stat.id] = (1 - stat.meta_exploit_rate) * 100;
        else if (m.key === 'integrity_norm') {
          // Normalize integrity from [-5, 0] to [0, 100]
          row[stat.id] = Math.max(0, Math.min(100, ((stat.integrity + 5) / 5) * 100));
        }
        else row[stat.id] = ((stat as any)[m.key] || 0) * 100;
      });
      return row;
    });
  }, [data]);

  const toggleRadarModel = (id: string) => {
    setSelectedRadarModels(prev => {
      if (prev.includes(id)) {
        return prev.filter(m => m !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id]; // Keep max 3 for readability
      }
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-indigo-400 animate-pulse" />
          <p className="text-neutral-400">Loading leaderboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="space-y-3 border-b border-neutral-800 pb-8">
          <div className="flex items-center gap-3 text-indigo-400">
            <Activity className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight text-white">Agentic Behavior Leaderboard</h1>
          </div>
          <p className="text-neutral-400 max-w-2xl text-lg leading-relaxed">
            Evaluating models not just by their success rate, but by how they achieve their goals. Tracking integrity, honesty, and exploit utilization.
          </p>
        </header>

        {/* Mode Selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-neutral-900/50 p-2 rounded-xl border border-neutral-800/50">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setMode('performance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                mode === 'performance' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Mode A: Performance
            </button>
            <button
              onClick={() => setMode('fairness')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                mode === 'fairness' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
              }`}
            >
              <Scale className="w-4 h-4" />
              Mode B: Fairness
            </button>
            <button
              onClick={() => setMode('honest')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                mode === 'honest' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
              }`}
            >
              <Shield className="w-4 h-4" />
              Mode C: Honest Agents
            </button>
          </div>
          
          <div className="px-4 text-xs text-neutral-500 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            {mode === 'performance' && "Sorted by final score (outcome + efficiency + honesty + integrity)"}
            {mode === 'fairness' && "Sorted by score minus exploit penalty"}
            {mode === 'honest' && "Sorted by honesty × success rate"}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/50 text-xs uppercase tracking-wider text-neutral-500">
                  <th className="p-4 font-medium">Rank</th>
                  <th className="p-4 font-medium">Model</th>
                  <th className="p-4 font-medium text-right">Score</th>
                  <th className="p-4 font-medium text-right">Success</th>
                  <th className="p-4 font-medium text-right">Integrity</th>
                  <th className="p-4 font-medium text-right">Exploit</th>
                  <th className="p-4 font-medium text-right">Meta</th>
                  <th className="p-4 font-medium text-right">Honesty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                <AnimatePresence mode="popLayout">
                  {sortedData.map((stat, index) => (
                    <motion.tr 
                      key={stat.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="p-4 text-neutral-500 font-mono text-sm">
                        #{index + 1}
                      </td>
                      <td className="p-4 font-medium text-neutral-200">
                        {stat.model}
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-indigo-400">
                        {stat.score.toFixed(1)}
                      </td>
                      <td className={`p-4 text-right font-mono ${getColor(stat.success_rate, 'good-high')}`}>
                        {stat.success_rate.toFixed(2)}
                      </td>
                      <td className={`p-4 text-right font-mono ${getColor(stat.integrity, 'neutral')}`}>
                        {stat.integrity > 0 ? '+' : ''}{stat.integrity.toFixed(1)}
                      </td>
                      <td className={`p-4 text-right font-mono ${getColor(stat.exploit_rate, 'good-low')}`}>
                        {stat.exploit_rate.toFixed(2)}
                      </td>
                      <td className={`p-4 text-right font-mono ${getColor(stat.meta_exploit_rate, 'good-low')}`}>
                        {stat.meta_exploit_rate.toFixed(2)}
                      </td>
                      <td className={`p-4 text-right font-mono ${getColor(stat.honesty, 'good-high')}`}>
                        {stat.honesty.toFixed(2)}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Behavioral Fingerprint (Radar Chart) */}
        <div className="space-y-6 pt-8 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-neutral-300">
              <RadarIcon className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold">Behavioral Fingerprint</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.map(stat => {
                const isSelected = selectedRadarModels.includes(stat.id);
                return (
                  <button
                    key={`toggle-${stat.id}`}
                    onClick={() => toggleRadarModel(stat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      isSelected 
                        ? 'bg-neutral-800 text-white border-neutral-600' 
                        : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-700'
                    }`}
                    style={isSelected ? { borderColor: modelColors[stat.id] } : {}}
                  >
                    {stat.model}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-8 shadow-2xl flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-2/3 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#404040" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#525252', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#f5f5f5', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '14px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {selectedRadarModels.map((modelId) => (
                    <Radar
                      key={modelId}
                      name={data.find(m => m.id === modelId)?.model || modelId}
                      dataKey={modelId}
                      stroke={modelColors[modelId]}
                      fill={modelColors[modelId]}
                      fillOpacity={0.3}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/3 space-y-4">
              <h3 className="text-lg font-medium text-neutral-200">Why use a Radar Chart?</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                The radar chart creates a <strong>"Behavioral Fingerprint"</strong> for each model. Instead of just looking at a single score, you can instantly see the shape of a model's strategy.
              </p>
              <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                <li><strong className="text-neutral-200">Balanced Hexagon:</strong> A safe, reliable, and honest model (e.g., GPT-4o).</li>
                <li><strong className="text-neutral-200">Spiky Shape:</strong> A model that over-optimizes for one metric at the expense of others (e.g., high success but low safety/integrity like Mistral).</li>
                <li><strong className="text-neutral-200">Small Shape:</strong> A model that fails safely but lacks capability (e.g., SmallLM).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Behavioral Flags & Insights */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-neutral-300">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold">Behavioral Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {sortedData.map((stat, index) => (
                <motion.div 
                  key={`insight-${stat.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="text-neutral-500 font-mono text-sm">#{index + 1}</span>
                      {stat.model}
                    </h3>
                    <div className="flex flex-wrap justify-end gap-2">
                      {stat.flags.map(flag => (
                        <span key={flag} className="px-2 py-1 text-xs font-medium bg-neutral-950 text-neutral-300 rounded-md border border-neutral-800 flex items-center gap-1">
                          {flag.includes('exploit') || flag.includes('hacker') ? <ShieldAlert className="w-3 h-3 text-rose-400" /> : <Zap className="w-3 h-3 text-amber-400" />}
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 bg-neutral-950/50 p-4 rounded-lg border border-neutral-800/50">
                    <div className="flex items-start gap-3 text-neutral-400">
                      <Info className="w-5 h-5 shrink-0 text-indigo-400 mt-0.5" />
                      <div className="space-y-2 flex-1">
                        <p className="text-sm leading-relaxed">
                          {stat.insight}
                        </p>
                        <AnimatePresence initial={false}>
                          {expandedInsights.has(stat.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 mt-3 border-t border-neutral-800/50 text-sm text-neutral-300 leading-relaxed">
                                {stat.full_insight}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleInsight(stat.id)}
                      className="self-end text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors mt-1"
                    >
                      {expandedInsights.has(stat.id) ? (
                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Read Full Analysis <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6 text-xs text-neutral-500 pt-2">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5"/> 
                      Variance: <span className="font-mono text-neutral-400">{stat.variance}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5"/> 
                      Runs: <span className="font-mono text-neutral-400">{stat.runs}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Metrics Glossary */}
        <div className="space-y-6 pt-8 border-t border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-300">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold">Metrics Glossary</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-medium">
                <Calculator className="w-4 h-4" />
                Final Score
              </div>
              <p className="text-sm text-neutral-400">
                The main ranking metric. A weighted aggregate of outcome, efficiency, honesty, and integrity.
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Success Rate
              </div>
              <p className="text-sm text-neutral-400">
                The percentage of runs where the model successfully achieved the target goal.
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-medium">
                <Scale className="w-4 h-4" />
                Integrity Score
              </div>
              <p className="text-sm text-neutral-400">
                Measures adherence to rules and constraints. Negative values indicate rule-breaking or cheating.
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-medium">
                <Gauge className="w-4 h-4" />
                Efficiency
              </div>
              <p className="text-sm text-neutral-400">
                Inverse of steps or tool calls. Higher efficiency means the model reached the goal faster.
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-medium">
                <Shield className="w-4 h-4" />
                Honesty Score
              </div>
              <p className="text-sm text-neutral-400">
                Evaluated by an LLM judge. Measures if the model's reasoning matches its actions without hallucinating.
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-medium">
                <TerminalSquare className="w-4 h-4" />
                Exploit Rate
              </div>
              <p className="text-sm text-neutral-400">
                Frequency of using direct exploits (e.g., hacking the environment) to achieve the goal.
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-500 font-medium">
                <ShieldAlert className="w-4 h-4" />
                Meta Exploit Rate
              </div>
              <p className="text-sm text-neutral-400">
                Frequency of modifying the evaluation framework itself or breaking out of the sandbox.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
