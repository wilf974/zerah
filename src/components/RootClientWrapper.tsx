'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import ConsentBanner from './ConsentBanner';

/**
 * Wrapper client pour les providers globaux
 * - ThemeProvider pour le mode sombre/clair
 * - ConsentBanner pour la gestion RGPD des consentements
 */
export default function RootClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      {children}
      <ConsentBanner />
    </ThemeProvider>
  );
}

