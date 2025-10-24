'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast, ToastContainer } from '@/components/Toast';
import ThemeToggle from '@/components/ThemeToggle';
import ExtendedProfileForm from '@/components/ExtendedProfileForm';
import DonationLink from '@/components/DonationLink';

// Rendre cette page dynamique
export const dynamic = 'force-dynamic';

type User = {
  id: number;
  email: string;
  name: string | null;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email,
        });
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      addToast('Le nom ne peut pas être vide', 'warning');
      return;
    }

    if (!formData.email.trim()) {
      addToast('L&apos;email ne peut pas être vide', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/user', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      addToast('Profil mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      addToast('Erreur lors de la déconnexion', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Chargement du profil..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base">
              ← Retour
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hidden sm:inline text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition p-2"
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

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <Link href="/dashboard">
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  🎯 Dashboard
                </button>
              </Link>
              <Link href="/stats">
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  📊 Statistiques
                </button>
              </Link>
              <Link href="/settings">
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  🔐 Confidentialité
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Mon Profil</h1>

          {/* Donation Link */}
          <div className="mb-8">
            <DonationLink />
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            {isEditing ? (
              <>
                {/* Editing Mode */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name || '',
                        email: user.email,
                      });
                    }}
                    disabled={isSaving}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                  <p className="text-lg text-gray-900 dark:text-white">{user.name || 'Non défini'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition mt-6"
                >
                  Modifier le profil
                </button>
              </>
            )}
          </div>

          {/* Extended Profile Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Infos Santé & Activité</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Ces informations nous permettent de vous proposer des habitudes personnalisées et adaptées à votre profil.
            </p>
            <ExtendedProfileForm
              profile={{
                height: user.height,
                weight: user.weight,
                age: user.age,
                gender: user.gender,
                activityLevel: user.activityLevel,
              }}
              onSave={async (profile) => {
                try {
                  const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile),
                  });

                  if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour');
                  }

                  const updatedProfile = await response.json();
                  setUser((prev) => prev ? { ...prev, ...updatedProfile.user } : null);
                  addToast('Profil de santé mis à jour avec succès', 'success');
                } catch (error) {
                  console.error('Erreur:', error);
                  addToast('Erreur lors de la mise à jour du profil', 'error');
                }
              }}
            />
          </div>

          {/* Logout Button */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
