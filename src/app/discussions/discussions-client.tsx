'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast, ToastContainer } from '@/components/Toast';

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

interface Discussion {
  id: number;
  habitId: number | null;
  habit: Habit | null;
  userId: number;
  user: User;
  title: string;
  content: string;
  isPinned: boolean;
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    comments: number;
  };
}

interface Comment {
  id: number;
  discussionId: number;
  userId: number;
  user: User;
  content: string;
  parentId: number | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export default function DiscussionsClient() {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'detail'>('list');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const { toasts, addToast, removeToast } = useToast();

  // Form states
  const [newDiscussion, setNewDiscussion] = useState({
    habitId: '',
    title: '',
    content: ''
  });
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // Charger les discussions
  useEffect(() => {
    fetchDiscussions();
    fetchHabits();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const response = await fetch('/api/discussions?sort=recent');
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions);
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors du chargement des discussions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits');
      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits.filter((h: any) => !h.isArchived));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchDiscussionDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/discussions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedDiscussion(data.discussion);
        setComments(data.discussion.comments || []);
        setActiveTab('detail');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors du chargement de la discussion', 'error');
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDiscussion.title || !newDiscussion.content) {
      addToast('Titre et contenu requis', 'error');
      return;
    }

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId: newDiscussion.habitId ? parseInt(newDiscussion.habitId) : null,
          title: newDiscussion.title,
          content: newDiscussion.content
        })
      });

      if (response.ok) {
        addToast('Discussion créée !', 'success');
        setNewDiscussion({ habitId: '', title: '', content: '' });
        setActiveTab('list');
        fetchDiscussions();
      } else {
        addToast('Erreur lors de la création', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la création', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !selectedDiscussion) return;

    try {
      const response = await fetch(`/api/discussions/${selectedDiscussion.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          parentId: replyingTo
        })
      });

      if (response.ok) {
        addToast('Commentaire ajouté !', 'success');
        setNewComment('');
        setReplyingTo(null);
        // Recharger les détails
        fetchDiscussionDetails(selectedDiscussion.id);
      } else {
        addToast('Erreur lors de l\'ajout du commentaire', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de l\'ajout du commentaire', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Forums</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Discutez avec la communauté
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm sm:text-base whitespace-nowrap"
          >
            ← Retour
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'list'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            📋 Discussions
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            ✏️ Créer
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          {/* Liste des discussions */}
          {activeTab === 'list' && (
            <div>
              {discussions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    Aucune discussion pour le moment
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Créer la première discussion
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      onClick={() => fetchDiscussionDetails(discussion.id)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                          {discussion.isPinned && '📌 '}
                          {discussion.title}
                        </h3>
                        {discussion.habit && (
                          <span className="text-2xl ml-2">{discussion.habit.icon}</span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {discussion.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Par {discussion.user.name || discussion.user.email}</span>
                          <span>👁️ {discussion.viewCount}</span>
                          <span>💬 {discussion._count.comments}</span>
                        </div>
                        <span>{formatDate(discussion.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Créer une discussion */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habitude liée (optionnel)
                </label>
                <select
                  value={newDiscussion.habitId}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, habitId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Aucune habitude --</option>
                  {habits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.icon} {habit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenu *
                </label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Créer la discussion
              </button>
            </form>
          )}

          {/* Détail d'une discussion */}
          {activeTab === 'detail' && selectedDiscussion && (
            <div>
              <button
                onClick={() => setActiveTab('list')}
                className="mb-4 text-blue-500 hover:text-blue-600 transition"
              >
                ← Retour à la liste
              </button>

              {/* En-tête de la discussion */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
                    {selectedDiscussion.isPinned && '📌 '}
                    {selectedDiscussion.title}
                  </h2>
                  {selectedDiscussion.habit && (
                    <span className="text-3xl ml-2">{selectedDiscussion.habit.icon}</span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                  {selectedDiscussion.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>Par {selectedDiscussion.user.name || selectedDiscussion.user.email}</span>
                  <span>👁️ {selectedDiscussion.viewCount}</span>
                  <span>{formatDate(selectedDiscussion.createdAt)}</span>
                </div>
              </div>

              {/* Formulaire de commentaire */}
              <form onSubmit={handleAddComment} className="mb-6">
                {replyingTo && (
                  <div className="mb-2 flex items-center justify-between text-sm text-blue-500">
                    <span>Réponse à un commentaire</span>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="hover:text-blue-600"
                    >
                      Annuler
                    </button>
                  </div>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Commenter
                </button>
              </form>

              {/* Liste des commentaires */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Commentaires ({comments.length})
                </h3>
                {comments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Aucun commentaire pour le moment
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      <div className="mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.user.name || comment.user.email}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Répondre
                      </button>

                      {/* Réponses */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-6 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                              <div className="mb-1">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {reply.user.name || reply.user.email}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
