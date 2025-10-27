'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/context/ThemeContext';

interface Feedback {
  id: number;
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'ux' | 'other';
  status: string;
  createdAt: string;
  updatedAt: string;
}

const categoryColors = {
  bug: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ux: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const statusIcons = {
  open: '🟡',
  'in-review': '🔵',
  planned: '🟢',
  completed: '✅',
  rejected: '❌',
};

const statusLabels = {
  open: 'Ouvert',
  'in-review': 'En révision',
  planned: 'Planifié',
  completed: 'Complété',
  rejected: 'Rejeté',
};

export default function FeedbackPage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ title: '', description: '', category: 'feature' });
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  // Charger les feedbacks existants
  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }

      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('Erreur:', error);
      setToast({ message: 'Erreur lors du chargement des feedbacks', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setToast({ message: 'Veuillez remplir tous les champs', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la soumission');
      }

      const newFeedback = await response.json();
      setFeedbacks([newFeedback, ...feedbacks]);
      setFormData({ title: '', description: '', category: 'feature' });
      setToast({ message: '✅ Merci ! Votre feedback a été envoyé avec succès !', type: 'success' });
      setActiveTab('history');
    } catch (error) {
      console.error('Erreur:', error);
      setToast({ message: error instanceof Error ? error.message : 'Erreur serveur', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-hide toast après 4 secondes
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">💡 Feedback & Suggestions</h1>
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Aidez-nous à améliorer Zerah en partageant vos idées
              </p>
            </div>
            <Link href="/dashboard" className={`px-4 py-2 rounded-lg transition ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
              ← Retour
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
        <div className="max-w-6xl mx-auto px-4 flex gap-4">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'submit'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : theme === 'dark'
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ✏️ Soumettre une idée
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : theme === 'dark'
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Mes idées ({feedbacks.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab: Soumettre */}
        {activeTab === 'submit' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 sm:p-8`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Catégorie */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Catégorie *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="bug">🐛 Bug - Signaler un problème</option>
                  <option value="feature">✨ Feature - Nouvelle fonctionnalité</option>
                  <option value="ux">🎨 UX - Amélioration de l&apos;interface</option>
                  <option value="other">💬 Autre - Commentaire général</option>
                </select>
              </div>

              {/* Titre */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Résumé concis de votre idée..."
                  maxLength={100}
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formData.title.length}/100
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description détaillée *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre idée ou le problème en détail..."
                  rows={6}
                  maxLength={1000}
                  className={`w-full px-4 py-2 rounded-lg border transition resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formData.description.length}/1000
                </p>
              </div>

              {/* Info box */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                  💡 <strong>Conseil:</strong> Soyez spécifique et fournissez des détails utiles pour nous aider à comprendre et prioriser votre feedback.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !formData.title.trim() || !formData.description.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    📤 Envoyer le feedback
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Historique */}
        {activeTab === 'history' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Vous n&apos;avez pas encore soumis de feedback 📭
                </p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Soumettre une idée
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map(feedback => (
                  <div
                    key={feedback.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 hover:shadow-lg transition`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[feedback.category]}`}>
                            {feedback.category === 'bug' && '🐛 Bug'}
                            {feedback.category === 'feature' && '✨ Feature'}
                            {feedback.category === 'ux' && '🎨 UX'}
                            {feedback.category === 'other' && '💬 Autre'}
                          </span>
                          <span className="text-lg">
                            {statusIcons[feedback.status as keyof typeof statusIcons] || '❓'}
                          </span>
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {statusLabels[feedback.status as keyof typeof statusLabels] || feedback.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{feedback.title}</h3>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} whitespace-pre-wrap break-words`}>
                          {feedback.description}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Soumis le {new Date(feedback.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
