'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Types de détails supportés pour les habitudes
 */
const DETAIL_TYPES = [
  { value: 'number', label: '📊 Nombre', placeholder: '0' },
  { value: 'duration', label: '⏱️ Durée (minutes)', placeholder: '0' },
  { value: 'distance', label: '🗺️ Distance (km)', placeholder: '0.0' },
  { value: 'custom', label: '✏️ Personnalisé', placeholder: 'Nom du détail' },
];

type HabitDetail = {
  id: number;
  name: string;
  type: string;
  unit?: string;
};

type HabitDetailsFormProps = {
  habitId: number;
  onDetailAdded: (detail: HabitDetail) => void;
};

/**
 * Composant pour ajouter des détails personnalisés à une habitude
 * Permet de définir des champs supplémentaires (ml, durée, distance, etc.)
 */
export default function HabitDetailsForm({ habitId, onDetailAdded }: HabitDetailsFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailType, setDetailType] = useState('number');
  const [customName, setCustomName] = useState('');
  const [unit, setUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddDetail = async () => {
    if (!customName.trim()) {
      alert('Le nom du détail est requis');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/habits/${habitId}/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName,
          type: detailType,
          unit: unit || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l&apos;ajout du détail');
      }

      const data = await response.json();
      onDetailAdded(data.detail);

      // Réinitialiser le formulaire
      setCustomName('');
      setUnit('');
      setDetailType('number');
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l&apos;ajout du détail');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-3"
      >
        + Ajouter un détail personnalisé
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800 dark:text-white">Ajouter un détail</h4>
        <button
          onClick={() => {
            setIsOpen(false);
            setCustomName('');
            setUnit('');
          }}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Sélection du type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type de détail
          </label>
          <select
            value={detailType}
            onChange={(e) => setDetailType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isLoading}
          >
            {DETAIL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nom du détail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom du détail
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ex: ml d&apos;eau, durée d&apos;exercice"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
        </div>

        {/* Unité (optionnel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unité (optionnel)
          </label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Ex: ml, min, km"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleAddDetail}
            disabled={isLoading || !customName.trim()}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Ajout en cours...' : 'Ajouter'}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setCustomName('');
              setUnit('');
            }}
            disabled={isLoading}
            className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
