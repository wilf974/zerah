export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Conditions d\'Utilisation - Zerah',
  description: 'Conditions d\'utilisation de Zerah Habit Tracker',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Conditions d&apos;Utilisation</h1>
        <p className="text-sm text-gray-500 mb-12">Dernière mise à jour : Octobre 2025</p>

        <div className="space-y-8">
          {/* 1. Acceptation */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptation des Conditions</h2>
            <p>
              En accédant et en utilisant Zerah Habit Tracker (&quot;l'Application&quot;), vous acceptez d'être lié par ces 
              conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application.
            </p>
          </section>

          {/* 2. Description du Service */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description du Service</h2>
            <p className="mb-4">
              Zerah est une application web gratuite de suivi d'habitudes qui permet aux utilisateurs de :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Créer et suivre des habitudes quotidiennes</li>
              <li>Consulter des statistiques personnalisées</li>
              <li>Recevoir des recommandations basées sur leur profil de santé</li>
              <li>Exporter leurs données personnelles</li>
            </ul>
          </section>

          {/* 3. Enregistrement & Authentification */}
          <section>
            <h2 className="text-2xl font-bold mb-4">3. Enregistrement et Authentification</h2>
            <p className="mb-4">Pour utiliser l'Application, vous devez :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Fournir une adresse email valide</li>
              <li>Accepter de recevoir des codes de connexion par email</li>
              <li>Maintenir la confidentialité de votre compte</li>
            </ul>
            <p className="mt-4">
              Vous êtes responsable de toutes les activités effectuées sur votre compte.
            </p>
          </section>

          {/* 4. Restrictions */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Restrictions d'Utilisation</h2>
            <p className="mb-4">Vous vous engagez à ne pas :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Utiliser l'Application à des fins illégales ou non autorisées</li>
              <li>Accéder ou tenter d'accéder aux systèmes sans autorisation</li>
              <li>Contourner les mesures de sécurité</li>
              <li>Télécharger ou transmettre des virus ou code malveillant</li>
              <li>Spammer ou harceler d'autres utilisateurs</li>
              <li>Violer les droits de propriété intellectuelle</li>
              <li>Utiliser des robots ou scripts automatisés</li>
              <li>Partager des données inexactes ou trompeuses</li>
            </ul>
          </section>

          {/* 5. Propriété Intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Propriété Intellectuelle</h2>
            <p className="mb-4">
              L'Application, son contenu, et ses fonctionnalités sont la propriété de Zerah Habit Tracker. 
              Vous ne pouvez pas reproduire, distribuer ou exploiter l'Application sans autorisation.
            </p>
            <p>
              Vos données (habitudes, statistiques) vous appartiennent. Vous pouvez les exporter à tout moment.
            </p>
          </section>

          {/* 6. Contenu Utilisateur */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Contenu Utilisateur</h2>
            <p className="mb-4">
              En utilisant l'Application, vous acceptez que :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Vous conservez tous les droits sur vos données</li>
              <li>Nous pouvons traiter vos données selon la Politique de Confidentialité</li>
              <li>Vos données resteront privées et ne seront pas partagées</li>
            </ul>
          </section>

          {/* 7. Limitations de Responsabilité */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Limitations de Responsabilité</h2>
            <p className="mb-4">
              <strong>L'Application est fournie &quot;EN L'ÉTAT&quot;.</strong> Zerah Habit Tracker ne garantit pas :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>L'absence d'interruptions ou d'erreurs</li>
              <li>La sécurité absolue contre les attaques</li>
              <li>Les bénéfices de santé spécifiques du suivi des habitudes</li>
              <li>L'exactitude des recommandations personnalisées</li>
            </ul>
            <p className="mt-4">
              <strong>L'Application ne remplace pas les conseils médicaux professionnels.</strong>
            </p>
          </section>

          {/* 8. Disponibilité du Service */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Disponibilité et Maintenance</h2>
            <p className="mb-4">
              Zerah se réserve le droit de :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Effectuer des maintenances (prévues ou non)</li>
              <li>Modifier ou interrompre des fonctionnalités</li>
              <li>Cesser l'exploitation de l'Application avec préavis</li>
            </ul>
          </section>

          {/* 9. Frais et Paiement */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Frais et Paiement</h2>
            <p>
              <strong>L'Application est 100% gratuite.</strong> Aucun paiement n'est requis pour utiliser 
              l'Application ou accéder à ses fonctionnalités de base.
            </p>
          </section>

          {/* 10. Données Personnelles */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Données Personnelles</h2>
            <p className="mb-4">
              Le traitement de vos données est régi par notre Politique de Confidentialité. En utilisant l'Application, 
              vous acceptez notre politique de traitement des données.
            </p>
            <p>
              <strong>Important :</strong> Les données collectées ne concerne que l'utilisateur qui les demande/partage.
            </p>
          </section>

          {/* 11. Sécurité des Comptes */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Sécurité des Comptes</h2>
            <p className="mb-4">Vous êtes responsable de :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Maintenir la confidentialité de votre email</li>
              <li>Signaler tout accès non autorisé</li>
              <li>Garder votre appareil sécurisé</li>
            </ul>
          </section>

          {/* 12. Résiliation */}
          <section>
            <h2 className="text-2xl font-bold mb-4">12. Résiliation de Compte</h2>
            <p className="mb-4">
              Vous pouvez demander la suppression de votre compte à tout moment. Après suppression :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Vos données seront supprimées après 30 jours (délai de rétractation)</li>
              <li>Vous recevrez une confirmation par email</li>
              <li>Vous pourrez vous réinscrire en utilisant le même email</li>
            </ul>
          </section>

          {/* 13. Modifications des Conditions */}
          <section>
            <h2 className="text-2xl font-bold mb-4">13. Modifications des Conditions</h2>
            <p>
              Zerah se réserve le droit de modifier ces conditions à tout moment. Les modifications seront 
              publiées sur cette page. Votre utilisation continue de l'Application constitue votre acceptation 
              des conditions modifiées.
            </p>
          </section>

          {/* 14. Loi Applicable */}
          <section>
            <h2 className="text-2xl font-bold mb-4">14. Loi Applicable</h2>
            <p>
              Ces conditions sont régies par la loi française et la conformité RGPD (Règlement Général sur la 
              Protection des Données).
            </p>
          </section>

          {/* 15. Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">15. Contact</h2>
            <p>
              Pour toute question concernant ces conditions, veuillez nous contacter via l'Application.
            </p>
          </section>
        </div>

        <div className="mt-16 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>⚖️ Avertissement Légal :</strong><br/>
            Cette application est fournie à titre informatif. Elle ne remplace pas les conseils médicaux ou 
            professionnels. En cas de problème de santé, consultez un professionnel qualifié.
          </p>
        </div>
      </div>
    </main>
  );
}
