'use client';

import { useState } from 'react';
import Link from 'next/link';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import HeatmapChart from '@/components/HeatmapChart';
import AdvancedStatsChart from '@/components/AdvancedStatsChart';
import SmartInsights from '@/components/SmartInsights';
import DataExport from '@/components/DataExport';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

// Rendre cette page dynamique (pas de pré-rendu statique)
export const dynamic = 'force-dynamic';

/**
 * Page de statistiques globales
 * Affiche le calendrier mensuel de toutes les habitudes
 */
export default function StatsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Statistiques</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Vue Calendrier */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vue Calendrier Mensuelle</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Consultez votre progression sur l&apos;ensemble du mois pour toutes vos habitudes.
            </p>
            <MonthlyCalendar />
          </div>

          {/* Heatmap Annuelle */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Heatmap Annuelle</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Visualisez votre progression quotidienne sur l&apos;année entière (style GitHub).
            </p>
            <HeatmapChart />
          </div>

          {/* Statistiques Avancées */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Statistiques Avancées</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comparez vos habitudes et visualisez votre progression annuelle.
            </p>
            <AdvancedStatsChart />
          </div>

          {/* Insights Intelligents */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">💡 Insights Intelligents</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Découvrez vos meilleurs jours, tendances et suggestions personnalisées.
            </p>
            <SmartInsights />
          </div>

          {/* Export de Données */}
          <div>
            <DataExport />
          </div>
        </div>
      </main>
    </div>
  );
}
