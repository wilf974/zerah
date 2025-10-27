'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from './LoadingSpinner';

type DetailStats = {
  id: number;
  name: string;
  type: string;
  unit?: string;
  data: Array<{ date: string; value: number }>;
  stats: {
    average: string | number;
    total: string | number;
    min: string | number;
    max: string | number;
    count: number;
  };
};

type DetailsStatsChartProps = {
  habitId: number;
};

/**
 * Composant pour afficher les statistiques détaillées avec graphiques
 */
export default function DetailsStatsChart({ habitId }: DetailsStatsChartProps) {
  const [detailsStats, setDetailsStats] = useState<DetailStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetailsStats();
  }, [habitId]);

  const loadDetailsStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/habits/${habitId}/details-stats`);
      if (response.ok) {
        const data = await response.json();
        setDetailsStats(data.details);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" text="Chargement des statistiques..." />;
  }

  if (detailsStats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Aucun détail personnalisé pour cette habitude</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {detailsStats.map((detail) => (
        <div key={detail.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="mb-4">
            <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
              {detail.name} {detail.unit && `(${detail.unit})`}
            </h4>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Moyenne</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {detail.stats.average}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {detail.stats.total}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Min</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {detail.stats.min}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Max</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {detail.stats.max}
                </p>
              </div>
            </div>
          </div>

          {/* Graphique */}
          {detail.data.length > 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={detail.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value.toFixed(2), detail.unit || 'Valeur']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('fr-FR');
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
          )}
        </div>
      ))}
    </div>
  );
}









