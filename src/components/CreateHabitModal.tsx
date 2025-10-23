'use client';

import { useState, useEffect } from 'react';
import { generateHabitRecommendations, HabitRecommendation } from '@/lib/recommendations';

type CreateHabitModalProps = {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    details?: Array<{ name: string; type: string; unit?: string }>;
  }) => void;
  isLoading?: boolean;
  userProfile?: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: string;
    activityLevel?: string;
  } | null;
};

const ICONS = ['📝', '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✨', '🎨', '🎵'];
const COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe',
  '#43e97b', '#fa709a', '#feca57', '#48dbfb',
  '#ff6b6b', '#ee5a6f', '#c44569', '#786fa6',
];

/**
 * Modal de création d'habitude avec recommandations intelligentes
 */
export default function CreateHabitModal({
  onClose,
  onCreate,
  isLoading,
  userProfile,
}: CreateHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📝');
  const [color, setColor] = useState('#667eea');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'recommendations'>('manual');
  const [recommendations, setRecommendations] = useState<HabitRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<HabitRecommendation | null>(null);

  /**
   * Charge les recommandations intelligentes au montage
   */
  useEffect(() => {
    if (userProfile) {
      const recs = generateHabitRecommendations(userProfile);
      setRecommendations(recs);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Le nom est requis');
      return;
    }

    setLoading(true);
    try {
      // Préparer les détails si une recommandation est sélectionnée
      const details = selectedRecommendation?.detail
        ? [selectedRecommendation.detail]
        : undefined;

      await onCreate({ name, description, icon, color, details });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remplit le formulaire avec une recommandation sélectionnée
   */
  const handleSelectRecommendation = (rec: HabitRecommendation) => {
    setSelectedRecommendation(rec);
    setName(rec.name);
    setDescription(rec.description);
    setIcon(rec.icon);
    // Chercher une couleur appropriée
    setColor('#667eea');
    setActiveTab('manual');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle habitude</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'manual'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            ✏️ Créer manuellement
          </button>
          {recommendations.length > 0 && (
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'recommendations'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              💡 Suggestions
            </button>
          )}
        </div>

        {/* Contenu onglet Recommandations */}
        {activeTab === 'recommendations' && recommendations.length > 0 && (
          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Basées sur votre profil personnel. Cliquez pour pré-remplir le formulaire.
            </p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recommendations.map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectRecommendation(rec)}
                  className={`w-full text-left p-4 border-l-4 rounded-lg transition ${
                    selectedRecommendation === rec
                      ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {rec.name}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {rec.description}
                      </p>
                      {rec.detail && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          📊 Avec détail : {rec.detail.name} ({rec.detail.unit})
                          {rec.detail.recommendedDaily && ` - Recommandé : ${rec.detail.recommendedDaily} ${rec.detail.unit}`}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contenu onglet Créer manuellement */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSubmit}>
            {/* Nom */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de l&apos;habitude *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Boire de l'eau"
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pourquoi cette habitude est importante..."
                rows={2}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50"
              />
            </div>

            {/* Icône */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icône
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    disabled={isLoading}
                    className={`text-2xl p-2 rounded-lg transition disabled:opacity-50 ${
                      icon === emoji
                        ? 'bg-purple-100 dark:bg-purple-900 ring-2 ring-purple-500'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Couleur */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur
              </label>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    disabled={isLoading}
                    className={`w-10 h-10 rounded-lg transition disabled:opacity-50 ${
                      color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Info détails */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 <strong>Conseil :</strong> Après création, vous pourrez ajouter des détails personnalisés (ml, durée, distance, etc.)
              </p>
            </div>

            {/* Affichage détail si recommandation sélectionnée */}
            {selectedRecommendation?.detail && (
              <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✅ <strong>Détail préconfigué :</strong> {selectedRecommendation.detail.name} ({selectedRecommendation.detail.unit})
                </p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRecommendation(null);
                  setName('');
                  setDescription('');
                  setIcon('📝');
                  setColor('#667eea');
                  setActiveTab('manual');
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Création...' : selectedRecommendation ? 'Créer avec détail' : 'Créer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

