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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                ← Retour
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">📊 Stats</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hidden sm:inline text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition p-2"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <Link href="/dashboard">
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  🎯 Dashboard
                </button>
              </Link>
              <Link href="/profile">
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  👤 Profil
                </button>
              </Link>
              <Link href="/settings">
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  🔐 Confidentialité
                </button>
              </Link>
            </div>
          )}
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
