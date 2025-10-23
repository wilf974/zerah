'use client';

import { useState } from 'react';
import { useToast } from './Toast';

type ExportFormat = 'csv' | 'json' | 'pdf';

/**
 * Composant pour exporter les données d'habitudes
 * Supporte CSV, JSON et PDF
 */
export default function DataExport() {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  /**
   * Exporte les données en CSV
   */
  const exportCSV = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/habits');

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data = await response.json();
      const habits = data.habits || [];

      // Construire le CSV
      let csv = 'Habitude,Date,Complétée\n';

      habits.forEach((habit: any) => {
        habit.entries.forEach((entry: any) => {
          csv += `"${habit.name}","${entry.date}","${entry.completed ? 'Oui' : 'Non'}"\n`;
        });
      });

      // Télécharger
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `habits-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Données exportées en CSV', 'success');
    } catch (error) {
      console.error(`Erreur lors de l'export CSV:`, error);
      addToast('Erreur lors de l\'export', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exporte les données en JSON
   */
  const exportJSON = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/habits');

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data = await response.json();

      // Télécharger
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `habits-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Données exportées en JSON', 'success');
    } catch (error) {
      console.error(`Erreur lors de l'export JSON:`, error);
      addToast('Erreur lors de l\'export', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exporte les données en PDF
   */
  const exportPDF = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/habits');

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data = await response.json();
      const habits = data.habits || [];

      // Note: Pour une vraie implémentation PDF, on aurait besoin d'une lib comme jsPDF
      // Pour l'instant, on fait un simple export HTML en PDF
      let htmlContent = `
        <html>
          <head>
            <title>Rapport Habitudes - Zerah</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #667eea; }
              h2 { color: #667eea; margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #667eea; color: white; }
              .completed { background-color: #d4edda; }
              .not-completed { background-color: #f8d7da; }
            </style>
          </head>
          <body>
            <h1>📊 Rapport Habitudes - Zerah</h1>
            <p>Généré le: ${new Date().toLocaleString('fr-FR')}</p>
      `;

      habits.forEach((habit: any) => {
        htmlContent += `
          <h2>${habit.name}</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
        `;

        habit.entries.forEach((entry: any) => {
          const rowClass = entry.completed ? 'completed' : 'not-completed';
          htmlContent += `
            <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td>${entry.date}</td>
              <td>${entry.completed ? '✓ Complété' : '✗ Non complété'}</td>
            </tr>
          `;
        });

        htmlContent += `
            </tbody>
          </table>
        `;
      });

      htmlContent += `
          </body>
        </html>
      `;

      // Ouvrir dans une nouvelle fenêtre pour impression PDF
      const newWindow = window.open('', '', 'height=600,width=900');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        setTimeout(() => {
          newWindow.print();
        }, 250);
      }

      addToast('Fenêtre PDF ouverte pour impression', 'success');
    } catch (error) {
      console.error(`Erreur lors de l'export PDF:`, error);
      addToast('Erreur lors de l\'export PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        📥 Exporter Mes Données
      </h2>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Téléchargez toutes vos données en différents formats pour la sauvegarde ou l&apos;analyse.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export CSV */}
        <button
          onClick={exportCSV}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? '⏳' : '📄'} Exporter en CSV
        </button>

        {/* Export JSON */}
        <button
          onClick={exportJSON}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? '⏳' : '{}'}  Exporter en JSON
        </button>

        {/* Export PDF */}
        <button
          onClick={exportPDF}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? '⏳' : '📕'} Exporter en PDF
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 Vos données sont privées et sécurisées. Les exports sont créés localement sur votre navigateur.
        </p>
      </div>
    </div>
  );
}
