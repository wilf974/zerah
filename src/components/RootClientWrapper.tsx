'use client';

import { ThemeProvider } from '@/context/ThemeContext';

/**
 * Wrapper client pour le ThemeProvider
 * Permet l'utilisation du ThemeProvider dans un layout server
 */
export default function RootClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

