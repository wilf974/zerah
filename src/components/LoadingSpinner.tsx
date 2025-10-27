'use client';

/**
 * Composant de spinner de chargement réutilisable
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  text = 'Chargement...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClass} animate-spin rounded-full border-4 border-gray-200 border-t-purple-600`} />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}









