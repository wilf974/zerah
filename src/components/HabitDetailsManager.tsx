'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import HabitDetailsForm from './HabitDetailsForm';

type HabitDetail = {
  id: number;
  name: string;
  type: string;
  unit?: string;
};

type HabitDetailsManagerProps = {
  habitId: number;
  habitName: string;
};

/**
 * Composant pour gérer les détails personnalisés d'une habitude
 * Permet de voir, créer et supprimer les détails
 */
export default function HabitDetailsManager({ habitId, habitName }: HabitDetailsManagerProps) {
  const [details, setDetails] = useState<HabitDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadDetails();
  }, [habitId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/habits/${habitId}/details`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data.details);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailAdded = (detail: HabitDetail) => {
    setDetails([...details, detail]);
  };

  const handleDeleteDetail = async (detailId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce détail ?')) return;

    setIsDeleting(detailId);
    try {
      const response = await fetch(`/api/habits/${habitId}/details/${detailId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDetails(details.filter((d) => d.id !== detailId));
      } else {
        alert('Erreur lors de la suppression du détail');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" text="Chargement des détails..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Détails de &quot;{habitName}&quot;
        </h3>
        <button
          onClick={() => window.history.back()}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Liste des détails existants */}
      {details.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
            Détails actuels ({details.length})
          </h4>
          {details.map((detail) => (
            <div
              key={detail.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">
                  {detail.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {detail.type} {detail.unit && `• ${detail.unit}`}
                </p>
              </div>
              <button
                onClick={() => handleDeleteDetail(detail.id)}
                disabled={isDeleting === detail.id}
                className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50"
              >
                {isDeleting === detail.id ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire pour ajouter un détail */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <HabitDetailsForm
          habitId={habitId}
          onDetailAdded={handleDetailAdded}
        />
      </div>

      {details.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-2">Aucun détail personnalisé pour le moment</p>
          <p className="text-sm">Cliquez sur &quot;Ajouter un détail&quot; pour en créer un</p>
        </div>
      )}
    </div>
  );
}









