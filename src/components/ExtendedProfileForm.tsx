'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

type ExtendedProfile = {
  activityLevel?: string;
  height?: number;
  weight?: number;
  gender?: string;
  age?: number;
};

type ExtendedProfileFormProps = {
  profile: ExtendedProfile;
  onSave: (profile: ExtendedProfile) => Promise<void>;
  isLoading?: boolean;
};

/**
 * Composant pour éditer le profil étendu (santé et activité)
 * Permet aux utilisateurs de renseigner leur profil pour des recommandations intelligentes
 */
export default function ExtendedProfileForm({
  profile,
  onSave,
  isLoading = false,
}: ExtendedProfileFormProps) {
  const [formData, setFormData] = useState<ExtendedProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  // Mettre à jour formData quand profile change
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'height' || name === 'weight' || name === 'age'
          ? value ? parseInt(value) : undefined
          : value ? value : undefined,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      // La mise à jour est gérée par le parent via le callback
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="sm" text="Chargement du profil..." />;
  }

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Profil de Santé
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Ces informations nous aident à vous recommander des habitudes personnalisées
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taille */}
        <div>
          <label
            htmlFor="height"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Taille (cm)
          </label>
          <input
            id="height"
            type="number"
            name="height"
            value={formData.height || ''}
            onChange={handleChange}
            disabled={isSaving}
            min="100"
            max="250"
            placeholder="Ex: 175"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Poids */}
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Poids (kg)
          </label>
          <input
            id="weight"
            type="number"
            name="weight"
            value={formData.weight || ''}
            onChange={handleChange}
            disabled={isSaving}
            min="30"
            max="300"
            placeholder="Ex: 75"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Âge */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Âge (années)
          </label>
          <input
            id="age"
            type="number"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            disabled={isSaving}
            min="10"
            max="120"
            placeholder="Ex: 30"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Genre */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Genre
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Non spécifié</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        {/* Niveau d'activité */}
        <div className="md:col-span-2">
          <label
            htmlFor="activityLevel"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Niveau d&apos;activité
          </label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel || ''}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Non spécifié</option>
            <option value="sedentaire">
              🛋️ Sédentaire (peu ou pas d&apos;exercice)
            </option>
            <option value="modere">
              🚶 Modéré (exercice 1-3 jours/semaine)
            </option>
            <option value="actif">
              🏃 Actif (exercice 4-5 jours/semaine)
            </option>
            <option value="tres_actif">
              💪 Très actif (exercice 6-7 jours/semaine)
            </option>
          </select>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Conseil :</strong> Ces informations vous permettront de
          recevoir des recommandations d&apos;habitudes personnalisées adaptées à votre
          profil
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Mise à jour...' : 'Enregistrer le profil'}
      </button>
    </div>
  );
}
