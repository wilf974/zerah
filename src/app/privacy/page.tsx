export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Politique de Confidentialité - Zerah',
  description: 'Politique de confidentialité et conformité RGPD pour Zerah Habit Tracker',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>
        <p className="text-sm text-gray-500 mb-12">Dernière mise à jour : Octobre 2025</p>

        <div className="space-y-8">
          {/* 1. Responsable du Traitement */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Responsable du Traitement</h2>
            <p className="mb-2">
              <strong>Entité :</strong> Zerah Habit Tracker
            </p>
            <p className="mb-2">
              <strong>Contact :</strong> Accessible via l'application
            </p>
          </section>

          {/* 2. Données Collectées */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Données Personnelles Collectées</h2>
            <p className="mb-4">Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Données d'identification :</strong> Email, nom (optionnel)</li>
              <li><strong>Profil de santé :</strong> Taille, poids, âge, sexe, niveau d'activité</li>
              <li><strong>Données d'habitudes :</strong> Habitudes créées, entrées, statistiques</li>
              <li><strong>Données techniques :</strong> Adresse IP, cookies, agent utilisateur</li>
              <li><strong>Consentements :</strong> Vos préférences de consentement</li>
            </ul>
          </section>

          {/* 3. Base Légale */}
          <section>
            <h2 className="text-2xl font-bold mb-4">3. Base Légale du Traitement</h2>
            <p className="mb-2">Nous traitons vos données sur base de :</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Contrat :</strong> Fourniture du service Zerah</li>
              <li><strong>Consentement :</strong> Pour emails marketing et analytics</li>
              <li><strong>Obligation légale :</strong> Conformité RGPD</li>
              <li><strong>Intérêt légitime :</strong> Amélioration du service</li>
            </ul>
          </section>

          {/* 4. Durée de Conservation */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Durée de Conservation des Données</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Compte actif :</strong> Données conservées pendant toute la durée d'utilisation</li>
              <li><strong>Compte supprimé :</strong> Données physiquement supprimées après 30 jours (délai de rétractation)</li>
              <li><strong>Sessions :</strong> 7 jours après création</li>
              <li><strong>Codes OTP :</strong> 10 minutes après génération</li>
              <li><strong>Logs serveur :</strong> 90 jours</li>
            </ul>
          </section>

          {/* 5. Vos Droits */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Vos Droits RGPD</h2>
            <p className="mb-4">Selon le RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>Droit d'accès (Art. 15) :</strong> Demander une copie de vos données
                <br/><span className="text-sm text-gray-600">→ Accessible dans Paramètres &gt; Mes Données</span>
              </li>
              <li>
                <strong>Droit de rectification (Art. 16) :</strong> Corriger vos données
                <br/><span className="text-sm text-gray-600">→ Modifiez votre profil directement</span>
              </li>
              <li>
                <strong>Droit à l'oubli (Art. 17) :</strong> Demander la suppression de votre compte
                <br/><span className="text-sm text-gray-600">→ Paramètres &gt; Supprimer mon compte</span>
              </li>
              <li>
                <strong>Droit à la portabilité (Art. 20) :</strong> Exporter vos données en JSON
                <br/><span className="text-sm text-gray-600">→ Paramètres &gt; Exporter mes données</span>
              </li>
              <li>
                <strong>Droit d'opposition (Art. 21) :</strong> S'opposer au traitement
                <br/><span className="text-sm text-gray-600">→ Gerez vos consentements dans Paramètres</span>
              </li>
              <li>
                <strong>Droit au retrait du consentement :</strong> Retirer vos consentements à tout moment
                <br/><span className="text-sm text-gray-600">→ Paramètres &gt; Consentements</span>
              </li>
            </ul>
          </section>

          {/* 6. Partage de Données */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Partage de Vos Données</h2>
            <p className="mb-4">Nous ne partageons pas vos données personnelles avec des tiers, sauf :</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Service d'email :</strong> Pour envoyer les codes OTP (SMTP sécurisé)</li>
              <li><strong>Hébergement :</strong> Stockage sur serveur sécurisé</li>
              <li><strong>Obligation légale :</strong> Si demandé par une autorité légale</li>
            </ul>
          </section>

          {/* 7. Sécurité */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Sécurité de Vos Données</h2>
            <p className="mb-4">Nous protégeons vos données par :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>✅ <strong>HTTPS/TLS :</strong> Chiffrage en transit</li>
              <li>✅ <strong>Cookies HTTP-only :</strong> Protection contre XSS</li>
              <li>✅ <strong>Sessions chiffrées :</strong> JWT avec encryption</li>
              <li>✅ <strong>Authentification OTP :</strong> Sans mot de passe</li>
              <li>✅ <strong>Base PostgreSQL :</strong> Chiffrage au repos (optionnel)</li>
              <li>✅ <strong>Firewall & WAF :</strong> Protection des services</li>
            </ul>
          </section>

          {/* 8. Cookies */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Utilisation de Cookies</h2>
            <p className="mb-4">Nous utilisons les cookies suivants :</p>
            <div className="space-y-3">
              <div>
                <strong>Cookies Essentiels (obligatoires) :</strong>
                <p className="text-sm text-gray-600">Session utilisateur, authentification, CSRF</p>
              </div>
              <div>
                <strong>Cookies Analytiques (consentement requis) :</strong>
                <p className="text-sm text-gray-600">Google Analytics (optionnel, demande consentement)</p>
              </div>
              <div>
                <strong>Cookies Marketing (consentement requis) :</strong>
                <p className="text-sm text-gray-600">Suivi de campagnes marketing (optionnel)</p>
              </div>
            </div>
          </section>

          {/* 9. Transferts Internationaux */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Transferts de Données</h2>
            <p>
              Vos données sont conservées dans l'UE et ne sont pas transférées vers pays tiers sans garanties appropriées.
            </p>
          </section>

          {/* 10. Consentement */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Gestion du Consentement</h2>
            <p className="mb-4">Vous pouvez à tout moment :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Donner votre consentement (via le banneau de consentement)</li>
              <li>Retirer votre consentement (via Paramètres &gt; Consentements)</li>
              <li>Modifier vos préférences de consentement</li>
            </ul>
          </section>

          {/* 11. Contact & Réclamations */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Exercer Vos Droits</h2>
            <p className="mb-4">Pour exercer vos droits RGPD :</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Connectez-vous à votre compte Zerah</li>
              <li>Allez dans Paramètres &gt; Confidentialité RGPD</li>
              <li>Choisissez l'action souhaitée (export, suppression, etc.)</li>
              <li>Vérifiez votre email pour confirmer la demande</li>
            </ol>
          </section>

          {/* 12. Autorité de Contrôle */}
          <section>
            <h2 className="text-2xl font-bold mb-4">12. Réclamation auprès d'une Autorité</h2>
            <p>
              Si vous estimez que nous ne respectons pas vos droits RGPD, vous pouvez déposer une réclamation auprès 
              de l'autorité de protection des données de votre pays (ex : CNIL en France).
            </p>
          </section>

          {/* 13. Modifications */}
          <section>
            <h2 className="text-2xl font-bold mb-4">13. Modifications de cette Politique</h2>
            <p>
              Nous pouvons modifier cette politique à tout moment. Les modifications seront publiées sur cette page 
              avec une date de mise à jour.
            </p>
          </section>
        </div>

        <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>📧 Des questions sur cette politique ?</strong><br/>
            Contactez-nous via l'application ou par email (disponible dans vos paramètres).
          </p>
        </div>
      </div>
    </main>
  );
}
