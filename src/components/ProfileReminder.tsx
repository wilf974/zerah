'use client';

import Link from 'next/link';

type UserProfile = {
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
};

/**
 * Composant de rappel pour compléter le profil utilisateur
 * Affiche un message si des informations importantes manquent
 */
export default function ProfileReminder({ profile }: { profile: UserProfile | null }) {
  // Si le profil n'est pas encore chargé, ne rien afficher
  if (!profile) {
    return null;
  }

  // Vérifier si le profil est complet
  const isProfileComplete = profile.height && profile.weight && profile.age && profile.gender && profile.activityLevel;

  // Si le profil est complet, ne rien afficher
  if (isProfileComplete) {
    return null;
  }

  // Compter les infos manquantes
  const missingFields = [];
  if (!profile.height) missingFields.push('taille');
  if (!profile.weight) missingFields.push('poids');
  if (!profile.age) missingFields.push('âge');
  if (!profile.gender) missingFields.push('sexe');
  if (!profile.activityLevel) missingFields.push('niveau d&apos;activité');

  return (
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <span className="text-3xl">💡</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Optimisez votre expérience Zerah !
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Pour bénéficier des <strong>suggestions d&apos;habitudes intelligentes</strong> adaptées à votre profil,
            complétez vos informations personnelles. Cela nous permettra de vous proposer :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">💧</span>
              <span>Quantité d&apos;eau recommandée selon votre poids</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">🏃</span>
              <span>Objectifs d&apos;exercice selon votre niveau</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500">😴</span>
              <span>Durée de sommeil selon votre âge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500">🎯</span>
              <span>Habitudes personnalisées à votre profil</span>
            </div>
          </div>

          {missingFields.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Informations manquantes :</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            <span>Compléter mon profil</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
