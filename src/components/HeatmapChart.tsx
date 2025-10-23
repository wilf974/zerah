'use client';

import { useState, useEffect } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

type HeatmapData = {
  date: string;
  completedCount: number;
  totalHabits: number;
  completionRate: number;
};

type HeatmapChartProps = {
  habitId?: number; // Si spécifié, affiche seulement l'habitude
  year?: number; // L'année à afficher (par défaut l'année actuelle)
};

/**
 * Composant heatmap de complétion (style GitHub)
 * Affiche la complétion des habitudes jour par jour sur une année
 */
export default function HeatmapChart({ habitId, year }: HeatmapChartProps) {
  const [heatmapData, setHeatmapData] = useState<Record<string, HeatmapData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const currentYear = year || new Date().getFullYear();

  useEffect(() => {
    loadHeatmapData();
  }, [currentYear, habitId]);

  /**
   * Charge les données de la heatmap pour l'année
   */
  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentYear, 0, 1).toISOString().split('T')[0];
      const endDate = new Date(currentYear, 11, 31).toISOString().split('T')[0];

      const url = habitId
        ? `/api/habits/${habitId}/calendar?startDate=${startDate}&endDate=${endDate}`
        : `/api/habits/calendar?startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const dataMap: Record<string, HeatmapData> = {};

        data.days.forEach((day: HeatmapData) => {
          dataMap[day.date] = day;
        });

        setHeatmapData(dataMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retourne la couleur en fonction du taux de complétion
   */
  const getIntensityClass = (completionRate: number): string => {
    if (completionRate === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (completionRate < 0.25) return 'bg-red-200 dark:bg-red-900';
    if (completionRate < 0.5) return 'bg-orange-300 dark:bg-orange-800';
    if (completionRate < 0.75) return 'bg-yellow-300 dark:bg-yellow-700';
    if (completionRate < 1) return 'bg-lime-300 dark:bg-lime-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31);
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Grouper les jours par semaine (sur 53 semaines)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Ajouter les jours du dimanche au samedi
  allDays.forEach((day) => {
    if (currentWeek.length === 0 && day.getDay() !== 0) {
      // Remplir avec des jours vides au début de l'année si nécessaire
      const emptyDays = Array(day.getDay()).fill(null).map((_, i) => {
        const d = new Date(day);
        d.setDate(d.getDate() - (day.getDay() - i));
        return d;
      });
      currentWeek.push(...emptyDays);
    }

    currentWeek.push(day);

    if (day.getDay() === 6 || day === allDays[allDays.length - 1]) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const selectedDayData = selectedDate ? heatmapData[selectedDate] : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Heatmap {currentYear}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Visualisez votre progression quotidienne sur l&apos;année entière
      </p>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Heatmap Grid */}
          <div className="overflow-x-auto mb-6">
            <div className="flex gap-1 p-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    const dateStr = day ? format(day, 'yyyy-MM-dd') : '';
                    const data = dateStr ? heatmapData[dateStr] : undefined;

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`
                          w-4 h-4 rounded cursor-pointer transition hover:ring-2 hover:ring-purple-400
                          ${data ? getIntensityClass(data.completionRate) : 'bg-transparent'}
                          ${selectedDate === dateStr ? 'ring-2 ring-purple-600' : ''}
                          ${!day ? 'opacity-0' : ''}
                        `}
                        onClick={() => setSelectedDate(dateStr)}
                        title={
                          data
                            ? `${format(day!, 'dd MMM yyyy', { locale: fr })}: ${data.completedCount}/${data.totalHabits}`
                            : ''
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Légende */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Légende :</p>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Aucune</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 dark:bg-red-900 rounded" />
                <span className="text-xs text-gray-600 dark:text-gray-400">&lt; 25%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-300 dark:bg-orange-800 rounded" />
                <span className="text-xs text-gray-600 dark:text-gray-400">25-50%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-300 dark:bg-yellow-700 rounded" />
                <span className="text-xs text-gray-600 dark:text-gray-400">50-75%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-lime-300 dark:bg-lime-700 rounded" />
                <span className="text-xs text-gray-600 dark:text-gray-400">75-100%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded" />
                <span className="text-xs text-gray-600 dark:text-gray-400">100%</span>
              </div>
            </div>
          </div>

          {/* Info Sélectionné */}
          {selectedDayData && selectedDate && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  {format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  ✅ {selectedDayData.completedCount} habitude(s) complétée(s) sur {selectedDayData.totalHabits}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  📊 Taux de complétion : {Math.round(selectedDayData.completionRate * 100)}%
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
