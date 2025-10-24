/* eslint-disable react/no-unescaped-entities */
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import ThemeToggle from '@/components/ThemeToggle';

/**
 * Settings Page - Gestion complète des paramètres RGPD
 * Permet aux utilisateurs de :
 * - Exporter leurs données
 * - Supprimer leur compte
 * - Gérer les consentements
 * - Consulter les politiques
 */
export default function SettingsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  useEffect(() => {
    // Charger le statut de suppression
    fetchDeletionStatus();
  }, []);

  /**
   * Récupérer le statut de suppression
   */
  const fetchDeletionStatus = async () => {
    try {
      const res = await fetch('/api/auth/delete-account');
      const data = await res.json();
      if (data.success) {
        setDeletionStatus(data.deletionStatus);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  /**
   * Exporter les données de l'utilisateur
   */
  const handleExportData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/export-data');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zerah-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast('✅ Données exportées avec succès', 'success');
      } else {
        addToast('❌ Erreur lors de l\'export', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('❌ Erreur lors de l\'export', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Demander la suppression du compte
   */
  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== 'OUI') {
      addToast('❌ Tapez OUI pour confirmer', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        addToast('✅ Demande de suppression enregistrée', 'success');
        setShowDeleteConfirm(false);
        setDeleteConfirmEmail('');
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/login');
      } else {
        addToast('❌ Erreur lors de la demande', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('❌ Erreur lors de la demande', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Annuler la suppression
   */
  const handleCancelDeletion = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        addToast('✅ Demande de suppression annulée', 'success');
        fetchDeletionStatus();
      } else {
        addToast('❌ Erreur lors de l\'annulation', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('❌ Erreur lors de l\'annulation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base">
                ← Retour
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">🔐 Confidentialité</h1>
            </div>
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
              <Link href="/profile">
                <button className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  👤 Profil
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-12">Gérez vos données personnelles selon les droits RGPD</p>

        <div className="space-y-6">
          {/* Statut de Suppression */}
          {deletionStatus?.hasActiveDeletionRequest && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-4">⚠️ Suppression en cours</h2>
              <p className="text-red-800 dark:text-red-300 mb-4">
                Votre compte est programmé pour suppression définitive le :<br/>
                <strong>{new Date(deletionStatus.deletionScheduledFor).toLocaleDateString('fr-FR')}</strong>
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                Vous avez 30 jours pour changer d'avis et annuler cette demande.
              </p>
              <button
                onClick={handleCancelDeletion}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                ❌ Annuler la suppression
              </button>
            </div>
          )}

          {/* Export de Données */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">📥 Exporter Mes Données</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Téléchargez une copie de toutes vos données personnelles en format JSON
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Art. 20 RGPD - Droit à la portabilité des données
                </p>
              </div>
              <button
                onClick={handleExportData}
                disabled={loading}
                className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 whitespace-nowrap font-semibold"
              >
                📥 Télécharger
              </button>
            </div>
          </section>

          {/* Gestion des Consentements */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">🍪 Gérer Les Consentements</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Contrôlez vos préférences pour les cookies analytiques et marketing
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Modifiez vos choix en utilisant le banneau de consentement
                </p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('gdpr-consent-given');
                  window.location.reload();
                }}
                className="ml-4 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg whitespace-nowrap font-semibold"
              >
                ⚙️ Réafficher le panneau
              </button>
            </div>
          </section>

          {/* Suppression du Compte */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">🗑️ Supprimer Mon Compte</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Demander la suppression permanente de votre compte et de vos données
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Art. 17 RGPD - Droit à l'oubli<br/>
                ⏰ Délai : 30 jours (vous pouvez annuler avant)
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deletionStatus?.hasActiveDeletionRequest || loading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 font-semibold"
                >
                  🗑️ Demander la suppression
                </button>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-900 dark:text-red-200 font-semibold mb-4">
                    ⚠️ Cette action est irréversible après 30 jours !
                  </p>
                  <p className="text-red-800 dark:text-red-300 mb-4">
                    Confirmez en tapant exactement <strong>OUI</strong> :
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder="Tapez OUI"
                    className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 font-semibold"
                    >
                      Confirmer la suppression
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmEmail('');
                      }}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Documents Légaux */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">📄 Documents Légaux</h2>
            <div className="space-y-3">
              <Link
                href="/privacy"
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 font-semibold"
              >
                🔐 Politique de Confidentialité
              </Link>
              <Link
                href="/terms"
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 font-semibold"
              >
                ⚖️ Conditions d&apos;Utilisation
              </Link>
            </div>
          </section>

          {/* Informations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>ℹ️ Conformité RGPD :</strong> Vos données ne concerne que vous.
              Vous avez le droit d'accès, de rectification, de portabilité et d'oubli.
              Consultez notre politique de confidentialité pour plus d'informations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
