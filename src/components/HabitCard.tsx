'use client';

import { useState, useEffect } from 'react';

type HabitDetail = {
  id: number;
  name: string;
  type: string;
  unit?: string;
};

type HabitCardProps = {
  habit: {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
  };
  isCompletedToday: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onViewStats: () => void;
  onManageDetails: () => void;
  userProfile?: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: string;
    activityLevel?: string;
  } | null;
};

/**
 * Calcule le nombre de verres d'eau recommandé par jour
 * Formule : poids (kg) * 30 ml / 240 ml (verre standard) + bonus activité
 */
function calculateWaterGlassTarget(userProfile?: any): number {
  if (!userProfile?.weight) return 8;
  const weight = userProfile.weight;
  const mlPerDay = weight * 30;
  const glassesPerDay = Math.round(mlPerDay / 240);
  let bonus = 0;
  if (userProfile.activityLevel === 'actif') bonus = 1;
  if (userProfile.activityLevel === 'tres_actif') bonus = 2;
  return glassesPerDay + bonus;
}

/**
 * Composant carte d'habitude avec coche journalière et détails personnalisés
 */
export default function HabitCard({
  habit,
  isCompletedToday,
  onToggle,
  onDelete,
  onViewStats,
  onManageDetails,
  userProfile,
}: HabitCardProps) {
  const [details, setDetails] = useState<HabitDetail[]>([]);
  const [detailValues, setDetailValues] = useState<Record<number, number | string>>({});
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingValues, setSavingValues] = useState(false);

  const isWaterHabit = habit.name.toLowerCase().includes('eau');
  const waterGlassTarget = calculateWaterGlassTarget(userProfile);

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit.id]);

  const loadDetails = async () => {
    try {
      setLoadingDetails(true);
      const response = await fetch(`/api/habits/${habit.id}/details`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data.details);
        
        // Charger les valeurs d'aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const valuesResponse = await fetch(`/api/habits/${habit.id}/entries/values?date=${today}`);
        const valuesData = await valuesResponse.ok ? await valuesResponse.json() : { values: {} };
        
        const initialValues: Record<number, number | string> = {};
        data.details.forEach((detail: HabitDetail) => {
          // Utiliser la valeur sauvegardée pour aujourd'hui, ou 0 par défaut
          initialValues[detail.id] = valuesData.values?.[detail.id] || 0;
        });
        setDetailValues(initialValues);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleWithDetails = async () => {
    if (!isCompletedToday && details.length > 0) {
      setShowDetailsForm(true);
    } else {
      onToggle();
      setShowDetailsForm(false);
      const initialValues: Record<number, number | string> = {};
      details.forEach((detail) => {
        initialValues[detail.id] = 0;
      });
      setDetailValues(initialValues);
    }
  };

  const handleSaveDetails = async () => {
    setSavingValues(true);
    try {
      const response = await fetch(`/api/habits/${habit.id}/entries/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          values: detailValues,
        }),
      });

      if (response.ok) {
        onToggle();
        setShowDetailsForm(false);
        const initialValues: Record<number, number | string> = {};
        details.forEach((detail) => {
          initialValues[detail.id] = 0;
        });
        setDetailValues(initialValues);
      } else {
        alert('Erreur lors de la sauvegarde des détails');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSavingValues(false);
    }
  };

  const handleIncrement = async (detailId: number, amount: number) => {
    const newValue = Math.max(0, ((detailValues[detailId] as number) || 0) + amount);
    
    // Mettre à jour l'état immédiatement
    setDetailValues((prev) => ({
      ...prev,
      [detailId]: newValue,
    }));

    // Sauvegarder immédiatement en base de données
    try {
      await fetch(`/api/habits/${habit.id}/entries/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          values: { [detailId]: newValue },
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleChange = (detailId: number, value: string) => {
    setDetailValues((prev) => ({
      ...prev,
      [detailId]: value ? parseFloat(value) : 0,
    }));
  };

  if (showDetailsForm && details.length > 0) {
    return (
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden"
        style={{ borderTop: `4px solid ${habit.color || '#667eea'}` }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {habit.name}
            </h3>
            <button
              onClick={() => setShowDetailsForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {details.map((detail) => (
              <div key={detail.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {detail.name} {detail.unit && `(${detail.unit})`}
                </label>

                {detail.type === 'number' && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleIncrement(detail.id, -1)}
                        disabled={savingValues}
                        className="px-2 py-1 bg-red-200 dark:bg-red-700 text-red-800 dark:text-white rounded hover:bg-red-300 dark:hover:bg-red-600 disabled:opacity-50 text-sm font-medium"
                      >
                        −
                      </button>
                      <button
                        onClick={() => handleIncrement(detail.id, 1)}
                        disabled={savingValues}
                        className="px-2 py-1 bg-green-200 dark:bg-green-700 text-green-800 dark:text-white rounded hover:bg-green-300 dark:hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleIncrement(detail.id, 5)}
                        disabled={savingValues}
                        className="px-2 py-1 bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
                      >
                        +5
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={detailValues[detail.id] || 0}
                      onChange={(e) => handleChange(detail.id, e.target.value)}
                      disabled={savingValues}
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                )}

                {detail.type === 'duration' && (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={detailValues[detail.id] || 0}
                    onChange={(e) => handleChange(detail.id, e.target.value)}
                    disabled={savingValues}
                    placeholder="Minutes"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                )}

                {detail.type === 'distance' && (
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={detailValues[detail.id] || 0}
                    onChange={(e) => handleChange(detail.id, e.target.value)}
                    disabled={savingValues}
                    placeholder="km"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                )}

                {detail.type === 'custom' && (
                  <input
                    type="text"
                    value={detailValues[detail.id] || ''}
                    onChange={(e) => handleChange(detail.id, e.target.value)}
                    disabled={savingValues}
                    placeholder="Saisir une valeur..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDetailsForm(false)}
              disabled={savingValues}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveDetails}
              disabled={savingValues}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition disabled:opacity-50 font-semibold"
            >
              {savingValues ? 'Sauvegarde...' : '✓ Valider'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      style={{ borderTop: `4px solid ${habit.color || '#667eea'}` }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{habit.icon || '📝'}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{habit.name}</h3>
              {habit.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{habit.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Button / Water Counter */}
        <div className="mb-4">
          {isWaterHabit && userProfile?.weight && details.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Verres d&apos;eau
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {detailValues[details[0]?.id] || 0}/{waterGlassTarget}
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (((detailValues[details[0]?.id] as number) || 0) / waterGlassTarget) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleIncrement(details[0].id, -1)}
                  disabled={loadingDetails || savingValues}
                  className="px-3 py-2 bg-red-200 dark:bg-red-700 text-red-800 dark:text-white rounded-lg hover:bg-red-300 dark:hover:bg-red-600 disabled:opacity-50 font-medium text-sm"
                >
                  −
                </button>
                <button
                  onClick={() => handleIncrement(details[0].id, 1)}
                  disabled={loadingDetails || savingValues}
                  className="flex-1 px-3 py-2 bg-green-200 dark:bg-green-700 text-green-800 dark:text-white rounded-lg hover:bg-green-300 dark:hover:bg-green-600 disabled:opacity-50 font-medium"
                >
                  +1 verre
                </button>
                <button
                  onClick={() => handleIncrement(details[0].id, 5)}
                  disabled={loadingDetails || savingValues}
                  className="px-3 py-2 bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-white rounded-lg hover:bg-blue-300 dark:hover:bg-blue-600 disabled:opacity-50 font-medium text-sm"
                >
                  +5
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleToggleWithDetails}
              disabled={loadingDetails}
              className={`w-full py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50 ${
                isCompletedToday
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {loadingDetails ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </span>
              ) : isCompletedToday ? (
                '✓ Complété aujourd\'hui'
              ) : (
                'Marquer comme fait'
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={onViewStats}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition"
          >
            📊 Statistiques
          </button>
          <button
            onClick={onManageDetails}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
          >
            ⚙️ Détails
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition"
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
