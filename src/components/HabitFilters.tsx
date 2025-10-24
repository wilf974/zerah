'use client';

import { useState } from 'react';

/**
 * Props pour le composant de filtres
 */
type HabitFiltersProps = {
  onFilterChange: (filters: {
    showArchived: boolean;
    category: string;
    sortBy: 'created' | 'name' | 'completion';
    sortOrder: 'asc' | 'desc';
  }) => void;
  categories: string[];
};

/**
 * Composant pour filtrer et trier les habitudes
 */
export default function HabitFilters({ onFilterChange, categories }: HabitFiltersProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'name' | 'completion'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({
      showArchived,
      category: selectedCategory,
      sortBy,
      sortOrder,
    });
  };

  const applyFilters = () => {
    handleFilterChange();
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <span>🔍 Filtres</span>
        <span className="text-sm">({showArchived ? '+Archivées' : ''})</span>
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4">
          {/* Afficher les archivées */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => {
                setShowArchived(e.target.checked);
                handleFilterChange();
              }}
              className="rounded"
            />
            <span className="text-sm">Afficher les habitudes archivées</span>
          </label>

          {/* Catégorie */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tri */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'created' | 'name' | 'completion');
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
              >
                <option value="created">Date création</option>
                <option value="name">Nom</option>
                <option value="completion">Complétion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ordre</label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'asc' | 'desc');
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
}
