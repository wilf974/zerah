import Link from 'next/link';
import DonationLink from '@/components/DonationLink';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">🎯 Zerah</h1>
          <p className="text-2xl text-blue-100 mb-8">
            Développez vos meilleures habitudes, jour après jour
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-purple-600 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition duration-200 shadow-lg"
          >
            Commencer gratuitement →
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">Suivi Simple</h3>
            <p className="text-blue-100">
              Cochez vos habitudes chaque jour et visualisez vos progrès facilement
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Statistiques</h3>
            <p className="text-blue-100">
              Suivez vos séries et votre taux de complétion avec des graphiques clairs
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">Personnalisable</h3>
            <p className="text-blue-100">
              Créez des habitudes avec des icônes et couleurs à votre image
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white mb-4">
            100% Gratuit, Sans Publicité
          </h2>
          <p className="text-blue-100 mb-8">
            Aucune carte de crédit requise. Commencez immédiatement.
          </p>
          <div className="max-w-sm mx-auto">
            <DonationLink />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-white/80 py-8">
        <p>© {new Date().getFullYear()} Zerah - Suivi d&apos;habitudes personnalisé</p>
      </footer>
    </div>
  );
}

