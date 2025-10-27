'use client';

import { useState } from 'react';

type DetailValue = {
  [key: number]: number | string;
};

type HabitDetail = {
  id: number;
  name: string;
  type: string;
  unit?: string;
};

type HabitEntryDetailsInputProps = {
  details: HabitDetail[];
  habitId: number;
  date: Date;
  onSave: (values: DetailValue) => Promise<void>;
  isLoading?: boolean;
};

/**
 * Composant pour saisir les valeurs des détails personnalisés d'une habitude
 * Permet l'entrée rapide avec boutons (+1, +5, etc.) ou champ numérique
 */
export default function HabitEntryDetailsInput({
  details,
  habitId,
  date,
  onSave,
  isLoading = false,
}: HabitEntryDetailsInputProps) {
  const [values, setValues] = useState<DetailValue>(
    details.reduce((acc, d) => ({ ...acc, [d.id]: 0 }), {})
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleIncrement = (detailId: number, amount: number) => {
    setValues((prev) => ({
      ...prev,
      [detailId]: Math.max(0, (prev[detailId] || 0) as number + amount),
    }));
  };

  const handleChange = (detailId: number, value: string) => {
    setValues((prev) => ({
      ...prev,
      [detailId]: value ? parseFloat(value) : 0,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(values);
      // Réinitialiser les valeurs après sauvegarde
      setValues(
        details.reduce((acc, d) => ({ ...acc, [d.id]: 0 }), {})
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (details.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg space-y-4">
      <h4 className="font-semibold text-gray-800 dark:text-white">Détails de cette entrée</h4>

      {details.map((detail) => (
        <div key={detail.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {detail.name} {detail.unit && `(${detail.unit})`}
          </label>

          {detail.type === 'number' && (
            <div className="flex items-center gap-2">
              {/* Boutons rapides */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleIncrement(detail.id, -1)}
                  disabled={isSaving || isLoading}
                  className="px-2 py-1 bg-red-200 dark:bg-red-700 text-red-800 dark:text-white rounded hover:bg-red-300 dark:hover:bg-red-600 disabled:opacity-50 text-sm"
                >
                  −1
                </button>
                <button
                  onClick={() => handleIncrement(detail.id, 1)}
                  disabled={isSaving || isLoading}
                  className="px-2 py-1 bg-green-200 dark:bg-green-700 text-green-800 dark:text-white rounded hover:bg-green-300 dark:hover:bg-green-600 disabled:opacity-50 text-sm"
                >
                  +1
                </button>
                <button
                  onClick={() => handleIncrement(detail.id, 5)}
                  disabled={isSaving || isLoading}
                  className="px-2 py-1 bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 disabled:opacity-50 text-sm"
                >
                  +5
                </button>
              </div>

              {/* Champ numérique */}
              <input
                type="number"
                min="0"
                step="0.1"
                value={values[detail.id] || 0}
                onChange={(e) => handleChange(detail.id, e.target.value)}
                disabled={isSaving || isLoading}
                className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          )}

          {detail.type === 'duration' && (
            <input
              type="number"
              min="0"
              step="1"
              value={values[detail.id] || 0}
              onChange={(e) => handleChange(detail.id, e.target.value)}
              disabled={isSaving || isLoading}
              placeholder="Minutes"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          )}

          {detail.type === 'distance' && (
            <input
              type="number"
              min="0"
              step="0.1"
              value={values[detail.id] || 0}
              onChange={(e) => handleChange(detail.id, e.target.value)}
              disabled={isSaving || isLoading}
              placeholder="km"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          )}

          {detail.type === 'custom' && (
            <input
              type="text"
              value={values[detail.id] || ''}
              onChange={(e) => handleChange(detail.id, e.target.value)}
              disabled={isSaving || isLoading}
              placeholder="Saisir une valeur..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={isSaving || isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isSaving ? 'Sauvegarde...' : 'Enregistrer les détails'}
      </button>
    </div>
  );
}









