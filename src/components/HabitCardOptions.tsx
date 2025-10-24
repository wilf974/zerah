'use client';

import { useState } from 'react';

/**
 * Props pour le composant d'options d'habitude
 */
type HabitCardOptionsProps = {
  habitId: number;
  isArchived?: boolean;
  category?: string;
  onArchiveChange: (isArchived: boolean) => Promise<void>;
  onCategoryChange: (category: string) => Promise<void>;
  onDelete: () => void;
};

/**
 * Composant pour les options d'une habitude (archiver, catégorie, etc.)
 */
export default function HabitCardOptions({
  habitId,
  isArchived = false,
  category,
  onArchiveChange,
  onCategoryChange,
  onDelete,
}: HabitCardOptionsProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState(category || '');

  const handleArchiveToggle = async () => {
    setIsLoading(true);
    try {
      await onArchiveChange(!isArchived);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySave = async () => {
    setIsLoading(true);
    try {
      await onCategoryChange(newCategory);
      setShowCategoryInput(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        title="Options"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          {/* Catégorie */}
          <button
            onClick={() => setShowCategoryInput(!showCategoryInput)}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center space-x-2"
          >
            <span>🏷️</span>
            <span>{category ? `Catégorie: ${category}` : 'Ajouter catégorie'}</span>
          </button>

          {showCategoryInput && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex: Sport, Santé..."
                className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleCategorySave}
                  disabled={isLoading}
                  className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowCategoryInput(false)}
                  className="flex-1 px-2 py-1 bg-gray-300 dark:bg-gray-600 text-xs rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Archiver/Désarchiver */}
          <button
            onClick={handleArchiveToggle}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center space-x-2 border-t border-gray-200 dark:border-gray-700 disabled:opacity-50"
          >
            <span>{isArchived ? '📂' : '📁'}</span>
            <span>{isArchived ? 'Désarchiver' : 'Archiver'}</span>
          </button>

          {/* Supprimer */}
          <button
            onClick={() => {
              onDelete();
              setShowOptions(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-2 border-t border-gray-200 dark:border-gray-700"
          >
            <span>🗑️</span>
            <span>Supprimer</span>
          </button>
        </div>
      )}
    </div>
  );
}
