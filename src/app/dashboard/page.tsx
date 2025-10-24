'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import HabitCard from '@/components/HabitCard';
import CreateHabitModal from '@/components/CreateHabitModal';
import HabitStatsModal from '@/components/HabitStatsModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast, ToastContainer } from '@/components/Toast';
import ThemeToggle from '@/components/ThemeToggle';
import DonationLink from '@/components/DonationLink';
import ProfileReminder from '@/components/ProfileReminder';

// Rendre cette page dynamique
export const dynamic = 'force-dynamic';

type Habit = {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  createdAt: string;
  entries: Array<{
    id: number;
    date: string;
    completed: boolean;
  }>;
};

type UserProfile = {
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
};

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userStats, setUserStats] = useState<{ onlineUsers: number; totalUsers: number } | null>(null);
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  /**
   * Charge les habitudes de l'utilisateur
   */
  const loadHabits = async () => {
    try {
      const response = await fetch('/api/habits');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }

      const data = await response.json();
      setHabits(data.habits);
    } catch (error) {
      console.error('Error loading habits:', error);
      addToast('Erreur lors du chargement des habitudes', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge le profil utilisateur pour les recommandations
   */
  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          height: data.user.height,
          weight: data.user.weight,
          age: data.user.age,
          gender: data.user.gender,
          activityLevel: data.user.activityLevel,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Pas de toast, c'est optionnel
    }
  };

  /**
   * Déconnecte l'utilisateur
   */
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      addToast('Déconnexion réussie', 'success');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      addToast('Erreur lors de la déconnexion', 'error');
    }
  };

  /**
   * Charge les statistiques d'utilisation de l'application
   */
  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/auth/stats');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Charger les stats au montage et les rafraîchir toutes les 30 secondes
  useEffect(() => {
    loadUserStats();
    const interval = setInterval(loadUserStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tracker l'activité de l'utilisateur toutes les 5 minutes
  // et déconnecter après 10 minutes d'inactivité
  useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;
    
    const trackActivity = async () => {
      try {
        await fetch('/api/auth/activity', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error tracking activity:', error);
      }
    };

    const resetInactivityTimer = () => {
      // Annuler le timer d'inactivité précédent
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }

      // Tracker immédiatement
      trackActivity();

      // Définir un nouveau timer pour 10 minutes d'inactivité
      inactivityTimeout = setTimeout(() => {
        console.log('User inactive for 10 minutes, logging out');
        handleLogout();
      }, 10 * 60 * 1000); // 10 minutes
    };

    // Tracker l'activité au montage
    resetInactivityTimer();

    // Listener sur les événements utilisateur
    const events = ['mousedown', 'keydown', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Cleanup
    return () => {
      clearTimeout(inactivityTimeout);
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  // Charger les habitudes et le profil au montage
  useEffect(() => {
    loadHabits();
    loadUserProfile();
  }, []);

  /**
   * Gère la création d'une nouvelle habitude
   */
  const handleCreateHabit = async (habitData: any) => {
    setActionLoading(-1);
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      addToast(`Habitude "${habitData.name}" créée avec succès ! 🎉`, 'success');
      await loadHabits();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating habit:', error);
      addToast('Erreur lors de la création de l\'habitude', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Supprime une habitude
   */
  const handleDeleteHabit = async (habitId: number, habitName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${habitName}" ?`)) {
      return;
    }

    setActionLoading(habitId);
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      addToast(`Habitude "${habitName}" supprimée`, 'success');
      await loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Marque/démarque une habitude pour aujourd'hui
   */
  const handleToggleToday = async (habitId: number, currentlyCompleted: boolean, habitName: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setActionLoading(habitId);

    try {
      if (currentlyCompleted) {
        // Supprimer l'entrée
        await fetch(`/api/habits/${habitId}/entries?date=${today}`, {
          method: 'DELETE',
        });
        addToast(`${habitName} marqué comme non complété`, 'info');
      } else {
        // Créer l'entrée
        await fetch(`/api/habits/${habitId}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today, completed: true }),
        });
        addToast(`${habitName} marqué comme complété ! ✓`, 'success');
      }

      await loadHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
      addToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Chargement de vos habitudes..." fullScreen={false} />
      </div>
    );
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-3xl">🎯</span>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zerah</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
                {userStats && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    🟢 {userStats.onlineUsers} en ligne / {userStats.totalUsers} inscrits
                  </p>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <ThemeToggle />
              <Link href="/stats">
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium text-sm lg:text-base px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  📊 Stats
                </button>
              </Link>
              <Link href="/profile">
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium text-sm lg:text-base px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  👤 Profil
                </button>
              </Link>
              <Link href="/settings">
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium text-sm lg:text-base px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  🔐 Confidentialité
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium text-sm lg:text-base px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                🚪 Déconnexion
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu - Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
              <Link href="/stats" onClick={() => setMobileMenuOpen(false)}>
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  📊 Statistiques
                </button>
              </Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  👤 Profil
                </button>
              </Link>
              <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  🔐 Confidentialité
                </button>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Donation Link */}
        <div className="mb-6">
          <DonationLink />
        </div>

        {/* Profile Reminder */}
        <ProfileReminder profile={userProfile} />

        {/* Actions */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition duration-200 shadow-lg disabled:opacity-50"
            disabled={showCreateModal}
          >
            + Nouvelle habitude
          </button>
        </div>

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Aucune habitude pour le moment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez votre première habitude pour commencer votre suivi
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Créer ma première habitude
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => {
              const todayEntry = habit.entries.find(
                (e) => format(new Date(e.date), 'yyyy-MM-dd') === todayStr
              );
              const isCompletedToday = todayEntry?.completed || false;

              return (
                <div key={habit.id} className="relative">
                  {actionLoading === habit.id && (
                    <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center z-20">
                      <LoadingSpinner size="sm" text="" />
                    </div>
                  )}
                  <HabitCard
                    habit={habit}
                    isCompletedToday={isCompletedToday}
                    onToggle={() => handleToggleToday(habit.id, isCompletedToday, habit.name)}
                    onDelete={() => handleDeleteHabit(habit.id, habit.name)}
                    onViewStats={() => setSelectedHabit(habit)}
                    onManageDetails={() => setSelectedHabit(habit)}
                    userProfile={userProfile}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateHabit}
          isLoading={actionLoading === -1}
          userProfile={userProfile}
        />
      )}

      {selectedHabit && (
        <HabitStatsModal
          habit={selectedHabit}
          onClose={() => setSelectedHabit(null)}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

