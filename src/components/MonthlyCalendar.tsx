'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

type DayStats = {
  date: string;
  completedCount: number;
  totalHabits: number;
  completionRate: number;
  habits: Array<{
    id: number;
    name: string;
    completed: boolean;
  }>;
};

type MonthlyCalendarProps = {
  habitId?: number; // Si spécifié, affiche seulement l'habitude
};

/**
 * Composant calendrier mensuel interactif
 * Affiche les habitudes complétées jour par jour avec un système de couleurs
 */
export default function MonthlyCalendar({ habitId }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysStats, setDaysStats] = useState<Record<string, DayStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [currentDate, habitId]);

  /**
   * Charge les données de complétion pour le mois
   */
  const loadMonthData = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(currentDate).toISOString().split('T')[0];
      const endDate = endOfMonth(currentDate).toISOString().split('T')[0];

      const url = habitId
        ? `/api/habits/${habitId}/calendar?startDate=${startDate}&endDate=${endDate}`
        : `/api/habits/calendar?startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const statsMap: Record<string, DayStats> = {};

        data.days.forEach((day: DayStats) => {
          statsMap[day.date] = day;
        });

        setDaysStats(statsMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du calendrier:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retourne la couleur en fonction du taux de complétion
   */
  const getColorClass = (completionRate: number): string => {
    if (completionRate === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (completionRate < 0.25) return 'bg-red-100 dark:bg-red-900';
    if (completionRate < 0.5) return 'bg-orange-100 dark:bg-orange-900';
    if (completionRate < 0.75) return 'bg-yellow-100 dark:bg-yellow-900';
    if (completionRate < 1) return 'bg-lime-100 dark:bg-lime-900';
    return 'bg-green-500 dark:bg-green-600';
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Ajouter les jours du mois précédent pour compléter la première semaine
  const firstDayOfWeek = monthStart.getDay();
  const previousMonthDays = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
    .fill(null)
    .map((_, i) => subMonths(monthStart, 1).setDate(new Date(subMonths(monthStart, 1)).getDate() - i))
    .reverse();

  const allDisplayDays = [...previousMonthDays, ...days];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← Précédent
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Légende :</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Aucune</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">&lt; 25%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">25-50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">50-75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-lime-100 dark:bg-lime-900 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">75-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 dark:bg-green-600 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">100%</span>
          </div>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center font-bold text-gray-700 dark:text-gray-300 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-2">
        {loading ? (
          <div className="col-span-7 text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          allDisplayDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const stats = daysStats[dateStr];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`
                  aspect-square rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer transition
                  ${!isCurrentMonth ? 'opacity-30 bg-gray-50 dark:bg-gray-900' : ''}
                  ${isToday ? 'ring-2 ring-purple-500' : ''}
                  ${stats ? getColorClass(stats.completionRate) : 'bg-gray-100 dark:bg-gray-800'}
                  hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-400
                `}
                title={stats ? `${stats.completedCount}/${stats.totalHabits} complétées` : 'Aucune donnée'}
              >
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {format(day, 'd')}
                </div>
                {stats && (
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {stats.completedCount}/{stats.totalHabits}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

