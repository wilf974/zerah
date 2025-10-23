import type { Metadata } from 'next';
import RootClientWrapper from '@/components/RootClientWrapper';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zerah - Suivi d\'habitudes personnalisé',
  description: 'Application gratuite de suivi d\'habitudes pour améliorer votre bien-être au quotidien',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const appliedTheme = theme || systemTheme;
                if (appliedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors">
        <RootClientWrapper>
          {children}
        </RootClientWrapper>
      </body>
    </html>
  );
}

