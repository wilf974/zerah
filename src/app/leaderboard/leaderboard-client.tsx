'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/context/ThemeContext';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string | null;
  userEmail: string;
  totalHabits: number;
  completionRate: number;
  currentStreak: number;
  totalCompletions: number;
  score: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
  period: string;
  totalUsers: number;
}

export default function LeaderboardContent() {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?period=${period}`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erreur:', error);
      setToast({ message: 'Erreur lors du chargement du classement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getPeriodLabel = (p: string) => {
    const labels: Record<string, string> = {
      week: 'Cette semaine',
      month: 'Ce mois',
      all: 'Tout temps'
    };
    return labels[p] || 'Ce mois';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const topThree = data?.leaderboard.slice(0, 3) || [];
  const restOfLeaderboard = data?.leaderboard.slice(3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Classement 🏆</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Les meilleurs performers de la communauté
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            ← Retour
          </Link>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-4 p-4 rounded-lg ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Period Filters */}
        <div className="flex justify-center gap-4 mb-8">
          {(['week', 'month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                period === p
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {getPeriodLabel(p)}
            </button>
          ))}
        </div>

        {/* Your Rank */}
        {data?.currentUserRank && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">
                Votre position
              </p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                #{data.currentUserRank}
              </p>
              <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                sur {data.totalUsers} participants
              </p>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              🏆 Podium 🏆
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className={`order-2 md:order-1 ${topThree[1].isCurrentUser ? 'ring-4 ring-blue-500' : ''}`}>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 text-center h-full flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="text-6xl mb-3">🥈</div>
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                        {(topThree[1].userName || topThree[1].userEmail)[0].toUpperCase()}
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                        {topThree[1].userName || topThree[1].userEmail.split('@')[0]}
                      </h3>
                      <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                        {topThree[1].score} pts
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white dark:bg-gray-900 rounded p-2">
                        <p className="text-gray-500 dark:text-gray-400">Habitudes</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[1].totalHabits}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded p-2">
                        <p className="text-gray-500 dark:text-gray-400">Taux</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[1].completionRate}%</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded p-2">
                        <p className="text-gray-500 dark:text-gray-400">Série</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[1].currentStreak}🔥</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className={`order-1 md:order-2 ${topThree[0].isCurrentUser ? 'ring-4 ring-blue-500' : ''}`}>
                  <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-600 dark:to-yellow-800 rounded-lg p-6 text-center h-full flex flex-col justify-between shadow-2xl transform md:scale-110">
                    <div>
                      <div className="text-7xl mb-3">🥇</div>
                      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-white dark:border-yellow-900">
                        {(topThree[0].userName || topThree[0].userEmail)[0].toUpperCase()}
                      </div>
                      <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-1">
                        {topThree[0].userName || topThree[0].userEmail.split('@')[0]}
                      </h3>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {topThree[0].score} pts
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white dark:bg-yellow-900 rounded p-2">
                        <p className="text-gray-500 dark:text-yellow-300">Habitudes</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[0].totalHabits}</p>
                      </div>
                      <div className="bg-white dark:bg-yellow-900 rounded p-2">
                        <p className="text-gray-500 dark:text-yellow-300">Taux</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[0].completionRate}%</p>
                      </div>
                      <div className="bg-white dark:bg-yellow-900 rounded p-2">
                        <p className="text-gray-500 dark:text-yellow-300">Série</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[0].currentStreak}🔥</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className={`order-3 ${topThree[2].isCurrentUser ? 'ring-4 ring-blue-500' : ''}`}>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-700 dark:to-orange-900 rounded-lg p-6 text-center h-full flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="text-6xl mb-3">🥉</div>
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                        {(topThree[2].userName || topThree[2].userEmail)[0].toUpperCase()}
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                        {topThree[2].userName || topThree[2].userEmail.split('@')[0]}
                      </h3>
                      <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                        {topThree[2].score} pts
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white dark:bg-gray-900 rounded p-2">
                        <p className="text-gray-500 dark:text-gray-400">Habitudes</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[2].totalHabits}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded p-2">
                        <p className="text-gray-500 dark:text-gray-400">Taux</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[2].completionRate}%</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded p-2">
                        <p className="text-gray-500 dark:text-gray-400">Série</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{topThree[2].currentStreak}🔥</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        {restOfLeaderboard.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Classement Complet
              </h2>
              <div className="space-y-2">
                {restOfLeaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 rounded-lg transition ${
                      entry.isCurrentUser
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 text-center">
                        <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                          #{entry.rank}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {(entry.userName || entry.userEmail)[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {entry.userName || entry.userEmail.split('@')[0]}
                          {entry.isCurrentUser && (
                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                              Vous
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.totalHabits} habitudes • {entry.completionRate}% taux • {entry.currentStreak}🔥 série
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {entry.score}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {data && data.leaderboard.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Aucun participant pour le moment
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Soyez le premier à apparaître dans le classement !
            </p>
          </div>
        )}

        {/* Score Explanation */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            💡 Comment le score est calculé ?
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• <strong>Completions :</strong> +10 points par jour complété</li>
            <li>• <strong>Taux de complétion :</strong> +5 points par pourcent</li>
            <li>• <strong>Série actuelle :</strong> +20 points par jour consécutif (uniquement &quot;Tout temps&quot;)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
