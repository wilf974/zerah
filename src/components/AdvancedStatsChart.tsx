'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from './LoadingSpinner';

type HabitStats = {
  habitId: number;
  habitName: string;
  completedCount: number;
  totalDays: number;
  completionRate: number;
  currentStreak: number;
  color: string;
};

type MonthData = {
  month: string;
  [key: string]: number | string; // Pour chaque habitude
};

type AdvancedStatsChartProps = {
  habitIds?: number[]; // Si spécifié, compare ces habitudes
};

const COLORS = [
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#f97316',
  '#06b6d4',
  '#84cc16',
];

/**
 * Composant de graphiques avancés
 * Affiche les statistiques annuelles et comparaisons entre habitudes
 */
export default function AdvancedStatsChart({ habitIds }: AdvancedStatsChartProps) {
  const [statsData, setStatsData] = useState<HabitStats[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabits, setSelectedHabits] = useState<number[]>(habitIds || []);

  useEffect(() => {
    loadAdvancedStats();
  }, []);

  /**
   * Charge les statistiques avancées de toutes les habitudes
   */
  const loadAdvancedStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/habits');

      if (response.ok) {
        const data = await response.json();
        const habits = data.habits;

        // Calculer les stats pour chaque habitude
        const stats = habits.map((habit: any) => {
          const entries = habit.entries || [];
          const completedCount = entries.filter((e: any) => e.completed).length;
          const totalDays = entries.length;
          const completionRate = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

          // Calculer la série actuelle
          const sortedEntries = [...entries].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          let currentStreak = 0;
          for (let i = 0; i < sortedEntries.length; i++) {
            if (sortedEntries[i].completed) {
              currentStreak++;
            } else {
              break;
            }
          }

          return {
            habitId: habit.id,
            habitName: habit.name,
            completedCount,
            totalDays,
            completionRate,
            currentStreak,
            color: habit.color || COLORS[habits.indexOf(habit) % COLORS.length],
          };
        });

        setStatsData(stats);

        // Charger les données mensuelles
        loadMonthlyData(habits);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats avancées:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge les données mensuelles pour le graphique en ligne
   */
  const loadMonthlyData = async (habits: any[]) => {
    const startDate = startOfYear(new Date());
    const endDate = endOfYear(new Date());
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    const data: MonthData[] = months.map((month) => ({
      month: format(month, 'MMM', { locale: fr }),
    }));

    // Pour chaque habitude, récupérer les données mensuelles
    for (const habit of habits) {
      const monthlyStats = data.map((_, monthIndex) => {
        const monthStart = new Date(new Date().getFullYear(), monthIndex, 1);
        const monthEnd = new Date(new Date().getFullYear(), monthIndex + 1, 0);

        const entries = habit.entries.filter((e: any) => {
          const date = new Date(e.date);
          return date >= monthStart && date <= monthEnd && e.completed;
        });

        return entries.length;
      });

      monthlyStats.forEach((count, index) => {
        data[index][habit.name] = count;
      });
    }

    setMonthlyData(data);
  };

  if (loading) {
    return <LoadingSpinner size="md" text="Chargement des statistiques..." />;
  }

  if (statsData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>Aucune habitude trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tableau Comparatif */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          📊 Comparaison des Habitudes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Habitude
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Complétée
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Taux
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Série
                </th>
              </tr>
            </thead>
            <tbody>
              {statsData.map((stat) => (
                <tr key={stat.habitId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {stat.habitName}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                      {stat.completedCount}/{stat.totalDays}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        stat.completionRate >= 75
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : stat.completionRate >= 50
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {stat.completionRate}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                      🔥 {stat.currentStreak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graphique en Ligne Mensuel */}
      {monthlyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📈 Complétion Mensuelle de l&apos;Année
          </h2>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {statsData.map((stat) => (
                  <Line
                    key={stat.habitId}
                    type="monotone"
                    dataKey={stat.habitName}
                    stroke={stat.color}
                    strokeWidth={2}
                    dot={{ fill: stat.color, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Graphique Circulaire - Répartition */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🥧 Répartition de l&apos;Effort
        </h2>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsData}
                dataKey="completedCount"
                nameKey="habitName"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique en Barres - Taux de Complétion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          📊 Taux de Complétion par Habitude
        </h2>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="habitName" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="completionRate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
