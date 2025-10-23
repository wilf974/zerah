'use client';

/**
 * Bouton pour basculer le thème (light/dark)
 * Version sans hooks pour éviter les problèmes de pré-rendu
 */
export default function ThemeToggle() {
  const handleClick = () => {
    // Toggle theme via localStorage and DOM manipulation
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    console.log('Toggled theme from:', currentTheme, 'to:', newTheme);
  };

  // Obtenir le thème actuel côté client
  const currentTheme = typeof window !== 'undefined'
    ? (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    : 'light';

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      aria-label={`Passer en mode ${currentTheme === 'light' ? 'sombre' : 'clair'}`}
      title={`Mode ${currentTheme === 'light' ? 'sombre' : 'clair'}`}
    >
      {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
