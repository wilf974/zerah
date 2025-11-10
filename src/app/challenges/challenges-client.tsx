'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/context/ThemeContext';

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface Habit {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
}

interface Participant {
  id: number;
  userId: number;
  user: User;
  status: string;
  currentProgress: number;
  joinedAt: string | null;
  completedAt: string | null;
}

interface Challenge {
  id: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  targetCompletions: number;
  status: string;
  createdAt: string;
  creator: User;
  habit: Habit;
  participants: Participant[];
  myParticipation?: {
    status: string;
    currentProgress: number;
    joinedAt: string | null;
    completedAt: string | null;
  };
}

interface ChallengesData {
  createdChallenges: Challenge[];
  participatingChallenges: Challenge[];
}

export default function ChallengesContent() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'created' | 'participating' | 'create'>('participating');
  const [challengesData, setChallengesData] = useState<ChallengesData>({
    createdChallenges: [],
    participatingChallenges: []
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Charger les défis au montage
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/challenges');

      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }

      const data = await response.json();
      setChallengesData(data);
    } catch (error) {
      console.error('Erreur:', error);
      setToast({ message: 'Erreur lors du chargement des défis', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeAction = async (challengeId: number, action: 'accept' | 'decline' | 'cancel') => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'action');
      }

      const actionText = action === 'accept' ? 'accepté' : action === 'decline' ? 'refusé' : 'annulé';
      setToast({ message: `Défi ${actionText}`, type: 'success' });
      await loadChallenges();
    } catch (error: any) {
      console.error('Erreur:', error);
      setToast({ message: error.message || 'Erreur lors de l\'action', type: 'error' });
    }
  };

  const syncProgress = async (challengeId: number) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/sync-progress`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la synchronisation');
      }

      setToast({ message: 'Progrès synchronisés', type: 'success' });
      await loadChallenges();
    } catch (error: any) {
      console.error('Erreur:', error);
      setToast({ message: error.message || 'Erreur lors de la synchronisation', type: 'error' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      invited: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      declined: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    const labels: Record<string, string> = {
      pending: 'En attente',
      active: 'Actif',
      completed: 'Terminé',
      cancelled: 'Annulé',
      invited: 'Invité',
      accepted: 'Accepté',
      declined: 'Refusé',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const renderChallengeCard = (challenge: Challenge, isCreated: boolean) => {
    const myParticipation = isCreated
      ? challenge.participants.find(p => p.userId === challenge.creator.id)
      : challenge.myParticipation;

    const progressPercentage = myParticipation
      ? Math.min(100, (myParticipation.currentProgress / challenge.targetCompletions) * 100)
      : 0;

    return (
      <div
        key={challenge.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
        onClick={() => setSelectedChallenge(challenge)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl`}
              style={{ backgroundColor: challenge.habit.color || '#6366f1' }}
            >
              {challenge.habit.icon || '🏆'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{challenge.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.habit.name}</p>
            </div>
          </div>
          {getStatusBadge(challenge.status)}
        </div>

        {/* Description */}
        {challenge.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{challenge.description}</p>
        )}

        {/* Dates et Objectif */}
        <div className="flex justify-between text-sm mb-4">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Début: </span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatDate(challenge.startDate)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Fin: </span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatDate(challenge.endDate)}</span>
          </div>
        </div>

        {/* Progrès */}
        {myParticipation && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Votre progrès</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {myParticipation.currentProgress} / {challenge.targetCompletions}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {challenge.participants.slice(0, 5).map((p, idx) => (
              <div
                key={p.id}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold"
                title={p.user.name || p.user.email}
              >
                {(p.user.name || p.user.email)[0].toUpperCase()}
              </div>
            ))}
            {challenge.participants.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold">
                +{challenge.participants.length - 5}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {challenge.participants.filter(p => p.status === 'accepted').length} participant(s)
          </span>
        </div>

        {/* Actions pour invitations */}
        {!isCreated && myParticipation?.status === 'invited' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChallengeAction(challenge.id, 'accept');
              }}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              Accepter
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChallengeAction(challenge.id, 'decline');
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition text-sm"
            >
              Refuser
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const invitationsCount = challengesData.participatingChallenges.filter(
    c => c.myParticipation?.status === 'invited'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Défis 🏆</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Challengez vos amis et atteignez vos objectifs ensemble
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            ← Retour
          </Link>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-4 p-4 rounded-lg ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-lg overflow-hidden mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('participating')}
              className={`flex-1 py-4 px-6 text-center font-medium transition relative ${
                activeTab === 'participating'
                  ? 'bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Mes Défis ({challengesData.participatingChallenges.length})
              {invitationsCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {invitationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'created'
                  ? 'bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Créés par moi ({challengesData.createdChallenges.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'create'
                  ? 'bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Créer un Défi +
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'participating' && (
          <div>
            {challengesData.participatingChallenges.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Aucun défi en cours
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Créez un défi ou attendez qu&apos;un ami vous invite
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Créer mon premier défi
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {challengesData.participatingChallenges.map(challenge =>
                  renderChallengeCard(challenge, false)
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'created' && (
          <div>
            {challengesData.createdChallenges.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Aucun défi créé
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Créez votre premier défi et invitez vos amis
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Créer un défi
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {challengesData.createdChallenges.map(challenge =>
                  renderChallengeCard(challenge, true)
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Créer un nouveau défi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette fonctionnalité sera disponible prochainement. Vous pourrez créer des défis personnalisés et inviter vos amis à vous rejoindre !
            </p>
            <div className="grid gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                  🎯 Objectifs personnalisables
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-400">
                  Définissez vos propres objectifs et périodes
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  👥 Invitez vos amis
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Challengez vos amis sur n&apos;importe quelle habitude
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                  📊 Suivez les progrès
                </h3>
                <p className="text-sm text-green-800 dark:text-green-400">
                  Tableau de bord en temps réel des participants
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal détails défi */}
        {selectedChallenge && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedChallenge(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedChallenge.name}
                </h2>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {selectedChallenge.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {selectedChallenge.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Habitude</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedChallenge.habit.icon} {selectedChallenge.habit.name}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Objectif</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedChallenge.targetCompletions} jours
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Début</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(selectedChallenge.startDate)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fin</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(selectedChallenge.endDate)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Participants ({selectedChallenge.participants.length})
                </h3>
                <div className="space-y-2">
                  {selectedChallenge.participants
                    .sort((a, b) => b.currentProgress - a.currentProgress)
                    .map((p) => {
                      const progress = (p.currentProgress / selectedChallenge.targetCompletions) * 100;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                              {(p.user.name || p.user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {p.user.name || p.user.email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {p.currentProgress} / {selectedChallenge.targetCompletions} jours
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(p.status)}
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    syncProgress(selectedChallenge.id);
                    setSelectedChallenge(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  🔄 Synchroniser les progrès
                </button>
                {selectedChallenge.creator.id === selectedChallenge.participants[0]?.userId && (
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir annuler ce défi ?')) {
                        handleChallengeAction(selectedChallenge.id, 'cancel');
                        setSelectedChallenge(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
