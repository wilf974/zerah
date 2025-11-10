'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/context/ThemeContext';

interface User {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
}

interface Friend {
  friendshipId: number;
  user: User;
  since: string;
}

interface FriendRequest {
  friendshipId: number;
  user: User;
  sentAt?: string;
  receivedAt?: string;
}

interface FriendsData {
  friends: Friend[];
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];
}

export default function FriendsContent() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friendsData, setFriendsData] = useState<FriendsData>({
    friends: [],
    sentRequests: [],
    receivedRequests: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Charger les amis et demandes au chargement
  useEffect(() => {
    loadFriends();
  }, []);

  // Auto-hide toast après 3 secondes
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friends');

      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }

      const data = await response.json();
      setFriendsData(data);
    } catch (error) {
      console.error('Erreur:', error);
      setToast({ message: 'Erreur lors du chargement des amis', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setToast({ message: 'Entrez au moins 2 caractères pour rechercher', type: 'error' });
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Erreur:', error);
      setToast({ message: 'Erreur lors de la recherche', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (targetUserId: number) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'envoi');
      }

      setToast({ message: 'Demande d\'ami envoyée avec succès', type: 'success' });
      setSearchResults(prev => prev.filter(u => u.id !== targetUserId));
      await loadFriends();
    } catch (error: any) {
      console.error('Erreur:', error);
      setToast({ message: error.message || 'Erreur lors de l\'envoi de la demande', type: 'error' });
    }
  };

  const handleFriendRequest = async (friendshipId: number, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }

      setToast({
        message: action === 'accept' ? 'Demande acceptée !' : 'Demande refusée',
        type: 'success'
      });
      await loadFriends();
    } catch (error: any) {
      console.error('Erreur:', error);
      setToast({ message: error.message || 'Erreur lors de la mise à jour', type: 'error' });
    }
  };

  const removeFriend = async (friendshipId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/friends?friendshipId=${friendshipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      setToast({ message: 'Ami supprimé', type: 'success' });
      await loadFriends();
    } catch (error: any) {
      console.error('Erreur:', error);
      setToast({ message: error.message || 'Erreur lors de la suppression', type: 'error' });
    }
  };

  const cancelRequest = async (friendshipId: number) => {
    try {
      const response = await fetch(`/api/friends?friendshipId=${friendshipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'annulation');
      }

      setToast({ message: 'Demande annulée', type: 'success' });
      await loadFriends();
    } catch (error: any) {
      console.error('Erreur:', error);
      setToast({ message: error.message || 'Erreur lors de l\'annulation', type: 'error' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Amis</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos amis et connectez-vous avec d&apos;autres utilisateurs
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            ← Retour
          </Link>
        </div>

        {/* Toast Notification */}
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
        <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'friends'
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Mes amis ({friendsData.friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-4 px-6 text-center font-medium transition relative ${
                activeTab === 'requests'
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Demandes ({friendsData.receivedRequests.length})
              {friendsData.receivedRequests.length > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendsData.receivedRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'search'
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg p-6">
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div>
              {friendsData.friends.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    Vous n&apos;avez pas encore d&apos;amis
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Rechercher des amis
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendsData.friends.map((friend) => (
                    <div
                      key={friend.friendshipId}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {(friend.user.name || friend.user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {friend.user.name || friend.user.email}
                          </p>
                          {friend.user.name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {friend.user.email}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Amis depuis le {formatDate(friend.since)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFriend(friend.friendshipId)}
                        className="px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-8">
              {/* Received Requests */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Demandes reçues ({friendsData.receivedRequests.length})
                </h3>
                {friendsData.receivedRequests.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                    Aucune demande en attente
                  </p>
                ) : (
                  <div className="space-y-4">
                    {friendsData.receivedRequests.map((request) => (
                      <div
                        key={request.friendshipId}
                        className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {(request.user.name || request.user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {request.user.name || request.user.email}
                            </p>
                            {request.user.name && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {request.user.email}
                              </p>
                            )}
                            {request.receivedAt && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Reçue le {formatDate(request.receivedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFriendRequest(request.friendshipId, 'accept')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => handleFriendRequest(request.friendshipId, 'reject')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition text-sm"
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Demandes envoyées ({friendsData.sentRequests.length})
                </h3>
                {friendsData.sentRequests.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                    Aucune demande envoyée
                  </p>
                ) : (
                  <div className="space-y-4">
                    {friendsData.sentRequests.map((request) => (
                      <div
                        key={request.friendshipId}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {(request.user.name || request.user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {request.user.name || request.user.email}
                            </p>
                            {request.user.name && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {request.user.email}
                              </p>
                            )}
                            {request.sentAt && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Envoyée le {formatDate(request.sentAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => cancelRequest(request.friendshipId)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                    placeholder="Rechercher par nom ou email..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={searchUsers}
                    disabled={searching || searchQuery.length < 2}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {searching ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              </div>

              {searchResults.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                  {searchQuery.length >= 2
                    ? 'Aucun utilisateur trouvé. Essayez une autre recherche.'
                    : 'Entrez au moins 2 caractères pour rechercher des utilisateurs'}
                </p>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user.name || user.email}
                          </p>
                          {user.name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
