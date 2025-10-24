'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DonationLink from '@/components/DonationLink';

type LogEntry = {
  timestamp: string;
  message: string;
  level: 'info' | 'error' | 'success';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const router = useRouter();

  /**
   * Ajoute un log au debug panel
   */
  const addLog = (message: string, level: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    console.log(`[${level.toUpperCase()}] ${message}`);
    setLogs(prev => [...prev, { timestamp, message, level }]);
  };

  /**
   * Envoie un code OTP à l'email fourni
   */
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      addLog(`Envoi OTP pour: ${email}`, 'info');
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      addLog(`Réponse serveur: ${response.status}`, 'info');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du code');
      }

      addLog('Code OTP envoyé avec succès! Vérifiez votre email.', 'success');
      setMessage('Code envoyé ! Vérifiez votre email.');
      setStep('code');
    } catch (err: any) {
      addLog(`Erreur: ${err.message}`, 'error');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérifie le code OTP et authentifie l'utilisateur
   */
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      addLog(`Vérification OTP: ${code}`, 'info');
      addLog(`Cookies avant: ${document.cookie || 'aucun'}`, 'info');
      
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });

      addLog(`Réponse OTP: ${response.status}`, 'info');
      
      const data = await response.json();
      
      addLog(`Cookies après réponse: ${document.cookie || 'aucun'}`, 'info');

      if (!response.ok) {
        addLog(`Erreur OTP: ${data.error}`, 'error');
        throw new Error(data.error || 'Code invalide');
      }

      addLog('✅ Authentification réussie!', 'success');
      addLog('Attente 1 seconde avant redirection...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('Redirection vers dashboard...', 'info');
      router.push('/dashboard');
    } catch (err: any) {
      addLog(`❌ Erreur: ${err.message}`, 'error');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🎯</h1>
          <h2 className="text-3xl font-bold text-white mb-2">Zerah</h2>
          <p className="text-blue-100">Développez vos meilleures habitudes</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 'email' ? (
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Connexion
                </h3>
                <p className="text-gray-600 text-sm">
                  Entrez votre email pour recevoir un code de connexion
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Vérification
                </h3>
                <p className="text-gray-600 text-sm">
                  Entrez le code à 6 chiffres envoyé à <strong>{email}</strong>
                </p>
              </div>

              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {loading ? 'Vérification...' : 'Se connecter'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError('');
                  setMessage('');
                }}
                className="w-full text-gray-600 text-sm hover:text-gray-800 transition"
              >
                ← Changer d&apos;email
              </button>
            </form>
          )}
        </div>

        {/* Donation Link */}
        <div className="mt-8">
          <DonationLink />
        </div>

        {/* Debug Panel - Mobile Testing */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="text-white text-xs bg-gray-700 hover:bg-gray-800 px-3 py-1 rounded transition"
          >
            {showDebug ? '🔍 Masquer Logs' : '🔍 Afficher Logs'}
          </button>
        </div>

        {showDebug && (
          <div className="mt-4 bg-black text-white rounded-lg p-4 max-h-48 overflow-y-auto text-xs font-mono border border-gray-700">
            <div className="mb-2 text-gray-400">--- Logs de débogage ---</div>
            {logs.length === 0 ? (
              <div className="text-gray-500">Aucun log pour le moment...</div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`mb-1 ${
                    log.level === 'error'
                      ? 'text-red-400'
                      : log.level === 'success'
                      ? 'text-green-400'
                      : 'text-blue-400'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-4 text-white text-sm">
          <p>Application gratuite</p>
        </div>
      </div>
    </div>
  );
}

