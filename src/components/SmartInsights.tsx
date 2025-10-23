'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from './LoadingSpinner';

type DayOfWeekStats = {
  day: string;
  dayName: string;
  completionRate: number;
  count: number;
};

type Insight = {
  type: 'best_day' | 'worst_day' | 'trend' | 'suggestion' | 'streak';
  emoji: string;
  title: string;
  description: string;
  metric?: string;
};

type SmartInsightsProps = {
  habitId?: number; // Si spécifié, analyse cette habitude uniquement
};

/**
 * Composant d'insights intelligents
 * Affiche les meilleurs jours, tendances, et suggestions
 */
export default function SmartInsights({ habitId }: SmartInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dayStats, setDayStats] = useState<DayOfWeekStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [habitId]);

  /**
   * Charge et calcule les insights
   */
  const loadInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/habits');

      if (!response.ok) throw new Error('Erreur');

      const data = await response.json();
      const habits = habitId
        ? data.habits.filter((h: any) => h.id === habitId)
        : data.habits;

      if (habits.length === 0) return;

      // Analyser les données
      const allInsights: Insight[] = [];

      // Calculer les stats par jour de semaine
      const dayOfWeekMap: Record<number, { completed: number; total: number }> = {
        0: { completed: 0, total: 0 }, // Dimanche
        1: { completed: 0, total: 0 }, // Lundi
        2: { completed: 0, total: 0 },
        3: { completed: 0, total: 0 },
        4: { completed: 0, total: 0 },
        5: { completed: 0, total: 0 },
        6: { completed: 0, total: 0 }, // Samedi
      };

      const allEntries: any[] = [];

      habits.forEach((habit: any) => {
        (habit.entries || []).forEach((entry: any) => {
          const date = new Date(entry.date);
          const dayOfWeek = date.getDay();

          dayOfWeekMap[dayOfWeek].total++;
          if (entry.completed) {
            dayOfWeekMap[dayOfWeek].completed++;
          }

          allEntries.push({
            ...entry,
            habitName: habit.name,
            habitId: habit.id,
          });
        });
      });

      // Convertir en array
      const dayStats: DayOfWeekStats[] = [
        { day: 'dim', dayName: 'Dimanche', completionRate: 0, count: 0 },
        { day: 'lun', dayName: 'Lundi', completionRate: 0, count: 0 },
        { day: 'mar', dayName: 'Mardi', completionRate: 0, count: 0 },
        { day: 'mer', dayName: 'Mercredi', completionRate: 0, count: 0 },
        { day: 'jeu', dayName: 'Jeudi', completionRate: 0, count: 0 },
        { day: 'ven', dayName: 'Vendredi', completionRate: 0, count: 0 },
        { day: 'sam', dayName: 'Samedi', completionRate: 0, count: 0 },
      ];

      Object.entries(dayOfWeekMap).forEach(([dayNum, stats]) => {
        const idx = parseInt(dayNum);
        dayStats[idx].completionRate =
          stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        dayStats[idx].count = stats.total;
      });

      setDayStats(dayStats);

      // Générer les insights
      const sortedDays = [...dayStats].sort((a, b) => b.completionRate - a.completionRate);

      // Meilleur jour
      if (sortedDays[0].completionRate > 0) {
        allInsights.push({
          type: 'best_day',
          emoji: '🏆',
          title: 'Meilleur jour',
          description: `Vous êtes le plus productif le ${sortedDays[0].dayName}`,
          metric: `${sortedDays[0].completionRate}%`,
        });
      }

      // Pire jour
      if (sortedDays[sortedDays.length - 1].completionRate < 100) {
        allInsights.push({
          type: 'worst_day',
          emoji: '⚠️',
          title: 'Jour de rattrapage',
          description: `Le ${sortedDays[sortedDays.length - 1].dayName} est votre jour le plus difficile`,
          metric: `${sortedDays[sortedDays.length - 1].completionRate}%`,
        });
      }

      // Tendance globale
      const sortedEntries = allEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      if (sortedEntries.length >= 14) {
        const last7 = sortedEntries.slice(0, 7).filter((e) => e.completed).length;
        const prev7 = sortedEntries.slice(7, 14).filter((e) => e.completed).length;
        const trend = last7 - prev7;

        if (trend > 0) {
          allInsights.push({
            type: 'trend',
            emoji: '📈',
            title: 'Tendance positive',
            description: `Vous avez complété ${trend} habitude(s) de plus cette semaine!`,
            metric: `+${trend}`,
          });
        } else if (trend < 0) {
          allInsights.push({
            type: 'trend',
            emoji: '📉',
            title: 'Tendance à surveiller',
            description: `Vous avez complété ${Math.abs(trend)} habitude(s) de moins cette semaine`,
            metric: `${trend}`,
          });
        }
      }

      // Suggestion
      const avgCompletion =
        dayStats.reduce((sum, d) => sum + d.completionRate, 0) / dayStats.length;

      if (avgCompletion < 50) {
        allInsights.push({
          type: 'suggestion',
          emoji: '💡',
          title: 'Suggestion',
          description: 'Essayez de commencer avec seulement 1-2 habitudes pour plus de facilité',
        });
      } else if (avgCompletion > 80) {
        allInsights.push({
          type: 'suggestion',
          emoji: '🚀',
          title: 'Vous faites du bon travail!',
          description: "Considérez l'ajout d'une nouvelle habitude pour progresser davantage",
        });
      }

      // Série actuelle
      let currentStreak = 0;
      for (let i = 0; i < sortedEntries.length; i++) {
        if (sortedEntries[i].completed) {
          currentStreak++;
        } else {
          break;
        }
      }

      if (currentStreak > 0) {
        allInsights.unshift({
          type: 'streak',
          emoji: '🔥',
          title: 'Série actuelle',
          description: `Vous avez une belle série! Continuez ainsi`,
          metric: `${currentStreak} jour${currentStreak > 1 ? 's' : ''}`,
        });
      }

      setInsights(allInsights);
    } catch (error) {
      console.error('Erreur lors du calcul des insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" text="Analyse de vos données..." />;
  }

  return (
    <div className="space-y-6">
      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.length > 0 ? (
          insights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-purple-500"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{insight.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {insight.description}
                  </p>
                  {insight.metric && (
                    <div className="mt-2 text-lg font-bold text-purple-600 dark:text-purple-400">
                      {insight.metric}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Pas assez de données pour générer des insights</p>
          </div>
        )}
      </div>

      {/* Jour de la Semaine Stats */}
      {dayStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📅 Analyse par Jour de la Semaine
          </h2>

          <div className="grid grid-cols-7 gap-2">
            {dayStats.map((stat) => (
              <div key={stat.day} className="text-center">
                <div
                  className={`
                    rounded-lg p-3 mb-2 transition
                    ${
                      stat.completionRate === 100
                        ? 'bg-green-100 dark:bg-green-900'
                        : stat.completionRate >= 75
                        ? 'bg-lime-100 dark:bg-lime-900'
                        : stat.completionRate >= 50
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : stat.completionRate > 0
                        ? 'bg-orange-100 dark:bg-orange-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }
                  `}
                >
                  <div className="font-bold text-gray-900 dark:text-white text-lg">
                    {stat.completionRate}%
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {stat.day}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.count}j
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
