'use client';

import { useEffect, useState } from 'react';
import Confetti from './Confetti';

interface StreakCelebrationProps {
  streak: number;
  habitName: string;
}

/**
 * Composant qui affiche une notification de célébration pour les séries de 7+ jours
 */
export default function StreakCelebration({ streak, habitName }: StreakCelebrationProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(streak);

  useEffect(() => {
    // Déclencher la célébration quand le streak atteint un multiple de 7
    if (streak >= 7 && streak % 7 === 0 && streak > previousStreak) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
    setPreviousStreak(streak);
  }, [streak, previousStreak]);

  if (streak < 7 || !showCelebration) return null;

  const celebrationMessages = {
    7: '🔥 Incroyable ! 7 jours d\'affilée !',
    14: '🚀 Fantastique ! 2 semaines d\'affilée !',
    21: '⭐ Exceptionnel ! 3 semaines d\'affilée !',
    30: '👑 Extraordinaire ! 1 mois d\'affilée !',
  };

  const getMessage = () => {
    if (streak === 7) return celebrationMessages[7];
    if (streak === 14) return celebrationMessages[14];
    if (streak === 21) return celebrationMessages[21];
    if (streak === 30) return celebrationMessages[30];
    if (streak > 30) return `🏆 Vous êtes un champion ! ${streak} jours d'affilée !`;
    return `✨ Awesome ! ${streak} jours consécutifs !`;
  };

  return (
    <>
      <Confetti trigger={showCelebration} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-8 py-6 rounded-2xl shadow-2xl text-center">
          <p className="text-xl font-bold mb-2">{getMessage()}</p>
          <p className="text-sm opacity-90">&quot;{habitName}&quot; - continuez comme ça ! 💪</p>
        </div>
      </div>
    </>
  );
}
