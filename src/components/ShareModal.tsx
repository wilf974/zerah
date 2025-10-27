'use client';

import { useState } from 'react';
import {
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton,
  TwitterIcon,
  FacebookIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon,
} from 'react-share';

type ShareModalProps = {
  habitName: string;
  streak: number;
  completionRate: number;
  onClose: () => void;
};

/**
 * Modal de partage d'habitude sur les réseaux sociaux
 * Permet de partager ses succès et ses séries
 */
export default function ShareModal({
  habitName,
  streak,
  completionRate,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // URL de la page de partage (domaine actuel)
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Messages personnalisés par réseau
  const shareTitle = `J'ai une série de ${streak} jours pour "${habitName}" sur Zerah! 🎯`;
  const shareDescription = `Je suis en train de construire une meilleure habitude: ${habitName}. Taux de complétion: ${completionRate}%. Rejoins-moi sur Zerah!`;
  const tweetText = `Je suis en train de tracker l'habitude "${habitName}" sur Zerah avec une série de ${streak} jours! 🔥 #HabitTracker #ProductivitPersonnelle`;
  const emailSubject = `Découvre comment je progress sur l'habitude "${habitName}" - Zerah`;
  const emailBody = `Salut! J'utilise Zerah pour tracker l'habitude "${habitName}". Actuellement, j'ai une série de ${streak} jours avec un taux de complétion de ${completionRate}%. Viens essayer aussi!`;

  // Copier le lien de partage
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Partager 🚀
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Message de partage */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>{habitName}</strong>
            <br />
            Série: <strong>{streak} jours</strong> 🔥
            <br />
            Complétion: <strong>{completionRate}%</strong> ✅
          </p>
        </div>

        {/* Boutons de partage */}
        <div className="space-y-3 mb-6">
          {/* Twitter */}
          <TwitterShareButton
            url={shareUrl}
            title={tweetText}
            className="!w-full"
          >
            <div className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg px-4 py-3 transition-colors">
              <TwitterIcon size={20} round className="!w-6 !h-6" />
              <span className="font-medium flex-1 text-left">X (Twitter)</span>
              <span className="text-xs">→</span>
            </div>
          </TwitterShareButton>

          {/* Facebook */}
          <FacebookShareButton
            url={shareUrl}
            hashtag="#HabitTracker"
            className="!w-full"
          >
            <div className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900 text-white rounded-lg px-4 py-3 transition-colors">
              <FacebookIcon size={20} round className="!w-6 !h-6" />
              <span className="font-medium flex-1 text-left">Facebook</span>
              <span className="text-xs">→</span>
            </div>
          </FacebookShareButton>

          {/* LinkedIn */}
          <LinkedinShareButton
            url={shareUrl}
            title={shareTitle}
            summary={shareDescription}
            source="Zerah - Habit Tracker"
            className="!w-full"
          >
            <div className="flex items-center gap-3 bg-blue-800 hover:bg-blue-900 dark:bg-blue-900 dark:hover:bg-blue-950 text-white rounded-lg px-4 py-3 transition-colors">
              <LinkedinIcon size={20} round className="!w-6 !h-6" />
              <span className="font-medium flex-1 text-left">LinkedIn</span>
              <span className="text-xs">→</span>
            </div>
          </LinkedinShareButton>

          {/* WhatsApp */}
          <WhatsappShareButton
            url={shareUrl}
            title={shareTitle}
            separator=" | "
            className="!w-full"
          >
            <div className="flex items-center gap-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg px-4 py-3 transition-colors">
              <WhatsappIcon size={20} round className="!w-6 !h-6" />
              <span className="font-medium flex-1 text-left">WhatsApp</span>
              <span className="text-xs">→</span>
            </div>
          </WhatsappShareButton>

          {/* Telegram */}
          <TelegramShareButton
            url={shareUrl}
            title={shareTitle}
            className="!w-full"
          >
            <div className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white rounded-lg px-4 py-3 transition-colors">
              <TelegramIcon size={20} round className="!w-6 !h-6" />
              <span className="font-medium flex-1 text-left">Telegram</span>
              <span className="text-xs">→</span>
            </div>
          </TelegramShareButton>

          {/* Email */}
          <EmailShareButton
            url={shareUrl}
            subject={emailSubject}
            body={emailBody}
            className="!w-full"
          >
            <div className="flex items-center gap-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800 text-white rounded-lg px-4 py-3 transition-colors">
              <EmailIcon size={20} round className="!w-6 !h-6" />
              <span className="font-medium flex-1 text-left">Email</span>
              <span className="text-xs">→</span>
            </div>
          </EmailShareButton>
        </div>

        {/* Copier le lien */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2 justify-center bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg px-4 py-2 transition-colors text-sm font-medium"
          >
            <span>📋</span>
            {copied ? 'Lien copié!' : 'Copier le lien'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Partage tes progrès et inspire les autres! 💪
        </p>
      </div>
    </div>
  );
}
