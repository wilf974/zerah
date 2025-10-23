/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useToast } from './Toast';

/**
 * ConsentBanner - Affiche un banneau de consentement RGPD
 * Permet aux utilisateurs de gérer leurs consentements pour :
 * - Cookies analytiques
 * - Cookies marketing
 * - Cookies essentiels (non consentis, obligatoires)
 */
export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consentAnalytics, setConsentAnalytics] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consentGiven = localStorage.getItem('gdpr-consent-given');
    if (!consentGiven) {
      setShowBanner(true);
    } else {
      const consent = JSON.parse(consentGiven);
      setConsentAnalytics(consent.analytics || false);
      setConsentMarketing(consent.marketing || false);
    }
  }, []);

  /**
   * Accepter tous les consentements
   */
  const handleAcceptAll = async () => {
    const consent = {
      analytics: true,
      marketing: true,
      cookies: true,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('gdpr-consent-given', JSON.stringify(consent));

    try {
      await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentAnalytics: true,
          consentMarketing: true,
          consentCookies: true,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du consentement :', error);
    }

    addToast('✅ Consentements acceptés', 'success');
    setShowBanner(false);
  };

  /**
   * Accepter seulement les essentiels
   */
  const handleRejectAll = async () => {
    const consent = {
      analytics: false,
      marketing: false,
      cookies: false,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('gdpr-consent-given', JSON.stringify(consent));

    try {
      await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentAnalytics: false,
          consentMarketing: false,
          consentCookies: false,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du consentement :', error);
    }

    addToast('✅ Paramètres sauvegardés', 'success');
    setShowBanner(false);
  };

  /**
   * Sauvegarder les consentements personnalisés
   */
  const handleSavePreferences = async () => {
    const consent = {
      analytics: consentAnalytics,
      marketing: consentMarketing,
      cookies: true, // Essentiels toujours activés
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('gdpr-consent-given', JSON.stringify(consent));

    try {
      await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentAnalytics,
          consentMarketing,
          consentCookies: true,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du consentement :', error);
    }

    addToast('✅ Vos préférences ont été sauvegardées', 'success');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 dark:bg-gray-950 text-white shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {!showDetails ? (
          // Vue simplifiée
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2">🍪 Politique de Consentement</h3>
              <p className="text-sm text-gray-300">
                Nous utilisons des cookies pour améliorer votre expérience. 
                Lire notre <a href="/privacy" className="underline hover:text-gray-100">politique de confidentialité</a>.
              </p>
            </div>
            <div className="flex gap-2 whitespace-nowrap">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition text-sm"
              >
                ⚙️ Paramètres
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition text-sm"
              >
                ❌ Refuser tout
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition text-sm font-bold"
              >
                ✅ Accepter tout
              </button>
            </div>
          </div>
        ) : (
          // Vue détaillée
          <div>
            <h3 className="font-bold text-lg mb-4">⚙️ Gérer Vos Consentements</h3>
            
            <div className="space-y-4 mb-6">
              {/* Essentiels - toujours activés */}
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <p className="font-semibold">🔒 Cookies Essentiels</p>
                  <p className="text-xs text-gray-400">Session, authentification, sécurité</p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-5 h-5"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <p className="font-semibold">📊 Cookies Analytiques</p>
                  <p className="text-xs text-gray-400">Comprendre comment vous utilisez l'app</p>
                </div>
                <input
                  type="checkbox"
                  checked={consentAnalytics}
                  onChange={(e) => setConsentAnalytics(e.target.checked)}
                  className="w-5 h-5"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <p className="font-semibold">📢 Cookies Marketing</p>
                  <p className="text-xs text-gray-400">Emails marketing et notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="w-5 h-5"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
              >
                ← Retour
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
              >
                Refuser tout
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition font-bold"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
