'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
}

/**
 * Composant qui affiche une animation confetti
 * Idéal pour célébrer des accomplissements (séries, badges, etc.)
 */
export default function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return;

    // Animation confetti classique
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Deuxième vague de confetti
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
      });
    }, 500);
  }, [trigger, duration]);

  return null;
}
