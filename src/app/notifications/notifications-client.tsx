'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast, ToastContainer } from '@/components/Toast';

interface NotificationPreferences {
  id: number;
  userId: number;
  emailEnabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;
  weeklyDigest: boolean;
  weeklyDigestDay: number;
  monthlyDigest: boolean;
  monthlyDigestDay: number;
  habitReminders: boolean;
  friendRequests: boolean;
  challengeInvites: boolean;
  challengeUpdates: boolean;
  discussionReplies: boolean;
  achievements: boolean;
}

export default function NotificationsClient() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors du chargement des préférences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        addToast('Préférences enregistrées !', 'success');
      } else {
        addToast('Erreur lors de la sauvegarde', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configurez vos préférences de notifications
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            ← Retour
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
          {/* Global Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Paramètres généraux
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Activer les notifications email
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Recevoir des emails de notification
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
                  className="w-5 h-5 text-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Daily & Periodic Reminders */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Rappels périodiques
            </h2>
            <div className="space-y-4">
              {/* Daily Reminder */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Rappel quotidien
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir un email chaque jour
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.dailyReminder}
                    onChange={(e) => updatePreference('dailyReminder', e.target.checked)}
                    className="w-5 h-5 text-blue-500"
                  />
                </label>
                {preferences.dailyReminder && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Heure du rappel
                    </label>
                    <input
                      type="time"
                      value={preferences.dailyReminderTime}
                      onChange={(e) => updatePreference('dailyReminderTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Weekly Digest */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Résumé hebdomadaire
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir un résumé chaque semaine
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.weeklyDigest}
                    onChange={(e) => updatePreference('weeklyDigest', e.target.checked)}
                    className="w-5 h-5 text-blue-500"
                  />
                </label>
                {preferences.weeklyDigest && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Jour de la semaine
                    </label>
                    <select
                      value={preferences.weeklyDigestDay}
                      onChange={(e) => updatePreference('weeklyDigestDay', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value={1}>Lundi</option>
                      <option value={2}>Mardi</option>
                      <option value={3}>Mercredi</option>
                      <option value={4}>Jeudi</option>
                      <option value={5}>Vendredi</option>
                      <option value={6}>Samedi</option>
                      <option value={7}>Dimanche</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Monthly Digest */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Résumé mensuel
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir un résumé chaque mois
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.monthlyDigest}
                    onChange={(e) => updatePreference('monthlyDigest', e.target.checked)}
                    className="w-5 h-5 text-blue-500"
                  />
                </label>
                {preferences.monthlyDigest && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Jour du mois (1-28)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      value={preferences.monthlyDigestDay}
                      onChange={(e) => updatePreference('monthlyDigestDay', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Types de notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Rappels d'habitudes
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Rappels pour compléter vos habitudes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.habitReminders}
                  onChange={(e) => updatePreference('habitReminders', e.target.checked)}
                  className="w-5 h-5 text-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Demandes d'amis
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Nouvelles demandes d'amitié
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.friendRequests}
                  onChange={(e) => updatePreference('friendRequests', e.target.checked)}
                  className="w-5 h-5 text-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Invitations aux défis
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Invitations à participer à des défis
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.challengeInvites}
                  onChange={(e) => updatePreference('challengeInvites', e.target.checked)}
                  className="w-5 h-5 text-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Mises à jour des défis
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Progrès et résultats des défis
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.challengeUpdates}
                  onChange={(e) => updatePreference('challengeUpdates', e.target.checked)}
                  className="w-5 h-5 text-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Réponses aux discussions
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Commentaires et réponses dans les forums
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.discussionReplies}
                  onChange={(e) => updatePreference('discussionReplies', e.target.checked)}
                  className="w-5 h-5 text-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Succès et récompenses
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Badges et accomplissements
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.achievements}
                  onChange={(e) => updatePreference('achievements', e.target.checked)}
                  className="w-5 h-5 text-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
