import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreakData, fetchRecentLogs } from '../services/storageService';
import { ClockIcon, FireIcon, TrophyIcon, GlobeIcon, NoteIcon } from './Icons';

type Props = {
  streak: StreakData;
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatDayKey = (isoOrDate: string) => {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const viewLabel = (view: string) => {
  const map: Record<string, string> = {
    FEED: 'Daily Feed',
    RESEARCH: 'Research Lab',
    NOTE_LIST: 'Notes',
    QUIZ: 'Mock Exams',
    STUDY_MATERIAL: 'Study Material',
    CSS_RESOURCES: 'Resources',
    HISTORY: 'History',
    AI_SUMMARIZER: 'AI Summarizer',
    FLASHCARDS: 'AI Flashcards',
    AI_LECTURE_NOTES: 'AI Lecture Notes',
    AI_MIND_MAP: 'Mind Map',
    STREAKS: 'Streaks',
    NEWS_EVENTS: 'News & Events',
  };
  return map[view] ?? view;
};

const actionLabel = (action: string) => {
  const map: Record<string, string> = {
    research_started: 'Research started',
    research_completed: 'Research completed',
    resource_opened: 'Resource opened',
    study_opened: 'Study opened',
    note_saved: 'Note saved',
    note_deleted: 'Note deleted',
    ai_summarizer_started: 'Summarizer started',
    ai_summarizer_completed: 'Summarizer completed',
    flashcards_started: 'Flashcards started',
    flashcards_completed: 'Flashcards completed',
    mind_map_started: 'Mind map started',
    mind_map_completed: 'Mind map completed',
    mind_map_node_opened: 'Mind map node opened',
    lecture_notes_started: 'Lecture notes started',
    lecture_notes_completed: 'Lecture notes completed',
    lecture_notes_copied: 'Lecture notes copied',
    view_session: 'Session',
  };
  return map[action] ?? action.replaceAll('_', ' ');
};

const iconForActivity = (row: any) => {
  const action = String(row?.action ?? '');
  if (action.startsWith('ai_') || action.includes('mind_map') || action.includes('flashcards') || action.includes('lecture')) return TrophyIcon;
  if (action.startsWith('research') || action.startsWith('resource')) return GlobeIcon;
  if (action.startsWith('note_')) return NoteIcon;
  return ClockIcon;
};

const StreaksView: React.FC<Props> = ({ streak }) => {
  const [days, setDays] = useState<7 | 14 | 30>(14);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void (async () => {
      const data = await fetchRecentLogs(days);
      if (!mounted) return;
      setLogs(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [days]);

  const analytics = useMemo(() => {
    const viewDurationsMs = new Map<string, number>();
    const actionCounts = new Map<string, number>();
    const dayBuckets: Array<{ day: string; minutes: number }> = [];
    const dayToMs = new Map<string, number>();

    for (const row of logs) {
      const action = String(row?.action ?? '');
      actionCounts.set(action, (actionCounts.get(action) ?? 0) + 1);

      if (action === 'view_session') {
        const view = String(row?.entity_id ?? row?.metadata?.view ?? '');
        const durationMs = Number(row?.metadata?.durationMs ?? 0);
        if (view) viewDurationsMs.set(view, (viewDurationsMs.get(view) ?? 0) + Math.max(0, durationMs));
        const dayKey = formatDayKey(String(row?.created_at ?? ''));
        if (dayKey) dayToMs.set(dayKey, (dayToMs.get(dayKey) ?? 0) + Math.max(0, durationMs));
      }
    }

    const totalMs = Array.from(viewDurationsMs.values()).reduce((a, b) => a + b, 0);
    const sortedViews = Array.from(viewDurationsMs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([view, ms]) => ({ view, ms }));

    const sortedDays = Array.from(dayToMs.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-Math.min(days, 30));

    for (const [day, ms] of sortedDays) {
      dayBuckets.push({ day, minutes: Math.round(ms / 60000) });
    }

    const researchCount = (actionCounts.get('research_completed') ?? 0) + (actionCounts.get('research_started') ?? 0);
    const aiCount =
      (actionCounts.get('ai_summarizer_completed') ?? 0) +
      (actionCounts.get('flashcards_completed') ?? 0) +
      (actionCounts.get('mind_map_completed') ?? 0) +
      (actionCounts.get('lecture_notes_completed') ?? 0);
    const notesCount = (actionCounts.get('note_saved') ?? 0);

    return {
      totalMs,
      sortedViews,
      dayBuckets,
      counts: {
        research: researchCount,
        ai: aiCount,
        notes: notesCount,
      },
    };
  }, [logs, days]);

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: 8, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <FireIcon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Streaks</h1>
              <p className="text-sm text-gray-500">
                {streak.count} day streak • last active {streak.lastVisitDate || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-900/5 border border-gray-200 rounded-2xl p-1 flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'overview' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'activity' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Activity
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-1 flex">
              {[7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d as 7 | 14 | 30)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${days === d ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ rotateX: 6, rotateY: -6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 transform-style-3d"
                  style={{ perspective: 1000 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 to-transparent" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Time spent</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{formatDuration(analytics.totalMs)}</p>
                      <p className="text-xs text-gray-500 mt-1">Last {days} days (tracked sessions)</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                      <ClockIcon className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ rotateX: 6, rotateY: 6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 transform-style-3d"
                  style={{ perspective: 1000 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Research</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.counts.research}</p>
                      <p className="text-xs text-gray-500 mt-1">Research starts/completions</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                      <GlobeIcon className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ rotateX: -6, rotateY: -6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 transform-style-3d"
                  style={{ perspective: 1000 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-transparent" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">AI + notes</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.counts.ai + analytics.counts.notes}</p>
                      <p className="text-xs text-gray-500 mt-1">{analytics.counts.ai} AI completions • {analytics.counts.notes} notes saved</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                      <TrophyIcon className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Top sections</h3>
                    <span className="text-xs text-gray-500">by time</span>
                  </div>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 rounded-2xl bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : analytics.sortedViews.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.sortedViews.map(({ view, ms }) => {
                        const pct = analytics.totalMs > 0 ? Math.round((ms / analytics.totalMs) * 100) : 0;
                        return (
                          <div key={view} className="flex items-center gap-3">
                            <div className="w-32 text-sm font-semibold text-gray-700 truncate">{viewLabel(view)}</div>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-pakGreen-600 to-emerald-500" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="w-24 text-right text-xs text-gray-500">{formatDuration(ms)}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No tracked sessions yet.</div>
                  )}
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Daily time</h3>
                    <span className="text-xs text-gray-500">minutes per day</span>
                  </div>
                  {loading ? (
                    <div className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
                  ) : analytics.dayBuckets.length > 0 ? (
                    <div className="flex items-end gap-1.5 h-32">
                      {analytics.dayBuckets.map(d => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full rounded-xl bg-gradient-to-t from-orange-500 to-red-500"
                            style={{ height: `${Math.max(6, Math.min(120, d.minutes * 2))}px` }}
                            title={`${d.day}: ${d.minutes}m`}
                          />
                          <div className="text-[10px] text-gray-400">{d.day.slice(5)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No daily time data yet.</div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-3xl border border-gray-200 bg-white overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recent activity</h3>
                  <p className="text-sm text-gray-500">Actions recorded for this account</p>
                </div>
                <div className="text-xs text-gray-500">{logs.length} logs</div>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : logs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {logs.slice(0, 80).map((row, idx) => {
                    const Icon = iconForActivity(row);
                    const createdAt = row?.created_at ? new Date(row.created_at) : null;
                    const when = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString() : '';
                    const action = String(row?.action ?? '');
                    const title =
                      action === 'view_session'
                        ? `${viewLabel(String(row?.entity_id ?? row?.metadata?.view ?? ''))} • ${formatDuration(Number(row?.metadata?.durationMs ?? 0))}`
                        : actionLabel(action);
                    const metaPreview =
                      action === 'resource_opened'
                        ? String(row?.metadata?.title ?? '')
                        : action === 'study_opened'
                          ? String(row?.metadata?.title ?? row?.metadata?.id ?? '')
                          : action === 'research_completed'
                            ? String(row?.metadata?.query ?? '')
                            : '';

                    return (
                      <motion.div
                        key={row?.id ?? idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(0.25, idx * 0.01) }}
                        className="p-4 md:p-5 flex items-start gap-4"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 truncate">{title}</div>
                              {metaPreview ? <div className="text-sm text-gray-500 truncate">{metaPreview}</div> : null}
                            </div>
                            <div className="text-xs text-gray-400 shrink-0">{when}</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center text-gray-500">No activity recorded yet.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StreaksView;

