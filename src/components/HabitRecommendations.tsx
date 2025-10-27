'use client';

import { useEffect, useState } from 'react';
import { generateHabitRecommendations, HabitRecommendation } from '@/lib/recommendations';

type UserProfile = {
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
};

type HabitRecommendationsProps = {
  profile: UserProfile;
};

/**
 * Composant pour afficher les recommandations intelligentes d'habitudes
 * basées sur le profil utilisateur (poids, taille, activité, âge)
 */
export default function HabitRecommendations({ profile }: HabitRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<HabitRecommendation[]>([]);

  useEffect(() => {
    const recs = generateHabitRecommendations(profile);
    setRecommendations(recs);
  }, [profile]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          💡 Habitudes Recommandées
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Basées sur votre profil personnalisé
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{rec.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {rec.name}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {rec.description}
                </p>
                {rec.detail && (
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-purple-200 dark:border-purple-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Recommandation :</strong> {rec.detail.recommendedDaily}{' '}
                      {rec.detail.unit}
                      {rec.detail.name && ` de ${rec.detail.name.toLowerCase()}`}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  📝 {rec.reason}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💬 Ces recommandations sont des suggestions. Adaptez-les selon vos
          capacités et votre rythme !
        </p>
      </div>
    </div>
  );
}









