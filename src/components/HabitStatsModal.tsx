'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import StreakCelebration from './StreakCelebration';
import DetailsStatsChart from './DetailsStatsChart';
import MonthlyCalendar from './MonthlyCalendar';
import HeatmapChart from './HeatmapChart';
import SmartInsights from './SmartInsights';
import ShareModal from './ShareModal';

type HabitStatsModalProps = {
  habit: {
    id: number;
    name: string;
    icon: string | null;
  };
  onClose: () => void;
};

type Stats = {
  currentStreak: number;
  totalCompletions: number;
  completionRate: number;
  completedThisMonth: number;
  daysInMonth: number;
  last30Days: Array<{
    date: string;
    completed: number;
  }>;
};

/**
 * Modal d'affichage des statistiques d'une habitude avec célébration pour les séries
 */
export default function HabitStatsModal({ habit, onClose }: HabitStatsModalProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'details-stats' | 'calendar' | 'heatmap' | 'insights'>('stats');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`/api/habits/${habit.id}/stats`);
        if (!response.ok) throw new Error('Erreur');
        
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [habit.id]);

  const tabs = [
    { id: 'stats', label: '📊 Statistiques', emoji: '📊' },
    { id: 'details-stats', label: '📈 Stats Détails', emoji: '📈' },
    { id: 'calendar', label: '📅 Calendrier', emoji: '📅' },
    { id: 'heatmap', label: '🔥 Heatmap', emoji: '🔥' },
    { id: 'insights', label: '💡 Insights', emoji: '💡' },
  ] as const;

  if (loading || !stats) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <StreakCelebration streak={stats.currentStreak} habitName={habit.name} />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl my-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <span className="text-2xl sm:text-3xl flex-shrink-0">{habit.icon || '📝'}</span>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{habit.name}</h2>
            </div>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              <button
                onClick={() => setShowShareModal(true)}
                className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-2xl p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title="Partager"
              >
                🚀
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 lg:px-6 py-3 font-semibold transition whitespace-nowrap text-sm lg:text-base ${
                  activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Tab Selector */}
          <div className="sm:hidden mb-6">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Tab */}
          {activeTab === 'stats' && (
          <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="text-3xl font-bold">{stats.currentStreak}</div>
              <div className="text-sm opacity-90">🔥 Série actuelle</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="text-3xl font-bold">{stats.totalCompletions}</div>
              <div className="text-sm opacity-90">✓ Total complété</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="text-3xl font-bold">{stats.completionRate}%</div>
              <div className="text-sm opacity-90">📈 Taux ce mois</div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
              <div className="text-3xl font-bold">
                {stats.completedThisMonth}/{stats.daysInMonth}
              </div>
              <div className="text-sm opacity-90">📅 Ce mois</div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              30 derniers jours
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.last30Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: fr })}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) =>
                      format(parseISO(value as string), 'dd MMMM yyyy', { locale: fr })
                    }
                    formatter={(value: number) => [value === 1 ? 'Complété ✓' : 'Non fait', '']}
                  />
                  <Bar dataKey="completed" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {stats.currentStreak > 0
                ? `🎉 Excellent ! Vous avez une série de ${stats.currentStreak} jour(s) !`
                : stats.totalCompletions > 0
                ? '💪 Continuez vos efforts, chaque jour compte !'
                : '🚀 Commencez votre première série dès aujourd\'hui !'}
            </p>
          </div>
          </>
          )}

          {/* Details Stats Tab */}
          {activeTab === 'details-stats' && (
            <DetailsStatsChart habitId={habit.id} />
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <MonthlyCalendar habitId={habit.id} />
          )}

          {/* Heatmap Tab */}
          {activeTab === 'heatmap' && (
            <HeatmapChart habitId={habit.id} />
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <SmartInsights habitId={habit.id} />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && stats && (
        <ShareModal
          habitName={habit.name}
          streak={stats.currentStreak}
          completionRate={stats.completionRate}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}

