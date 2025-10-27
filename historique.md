# Historique du Projet - Zerah (Suivi d'Habitudes Personnalisé)

## 📅 27 Octobre 2025 - Phase 8 : Système de Suggestions & Feedback ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `prisma/schema.prisma` - Ajout du modèle Feedback avec relation User
- ✅ `src/app/api/feedback/route.ts` - API GET/POST pour feedbacks
- ✅ `src/app/feedback/page.tsx` - Page complète avec formulaire + historique
- ✅ `src/app/dashboard/page.tsx` - Ajout lien vers /feedback (desktop + mobile)
- ✅ `TODO.md` - Mise à jour phase 8

**Fonctionnalités implémentées :**
- ✅ **Modèle Feedback** dans Prisma avec champs : id, userId, title, description, category, status, createdAt, updatedAt
- ✅ **Catégories** : bug 🐛, feature ✨, ux 🎨, other 💬
- ✅ **Statuts** : open, in-review, planned, completed, rejected
- ✅ **API GET /api/feedback** - Récupère les feedbacks de l'utilisateur authentifié
- ✅ **API POST /api/feedback** - Soumet un nouveau feedback avec validation
- ✅ **Email notification** - Envoie email à jean.maillot14@gmail.com avec détails du feedback
- ✅ **Page /feedback** - UI complète avec deux onglets :
  - "✏️ Soumettre une idée" : Formulaire avec sélection catégorie, titre, description
  - "📋 Mes idées" : Historique des feedbacks soumis avec statuts et dates
- ✅ **UI responsive** - Dark mode, mobile-friendly
- ✅ **Navigation** - Lien "💡 Feedback" dans les menus desktop et mobile du dashboard

**Sécurité & Validation :**
- ✅ Authentification requise (session JWT)
- ✅ Validation des champs (titre et description non vides)
- ✅ Validation catégorie (bug, feature, ux, other)
- ✅ Isolation des données (chaque utilisateur ne voit que ses feedbacks)
- ✅ Longueur max titre (100 chars) et description (1000 chars)

**Workflow utilisateur :**
1. Dashboard → Clic sur "💡 Feedback"
2. Remplir formulaire (catégorie, titre, description)
3. Clic "📤 Envoyer le feedback"
4. Email sent to owner + feedback visible en "Mes idées"
5. Statut suivi (🟡 Ouvert → 🔵 En révision → 🟢 Planifié → ✅ Complété)

**Prochaines étapes :**
→ Lancer Docker pour appliquer la migration Prisma
→ Tester la page en local
→ Déployer sur VPS

---

## 📅 24 Octobre 2025 - Phase 2 : Organisation des Habitudes ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `prisma/schema.prisma` - Ajout de isArchived, category, tags, frequency, targetDays
- ✅ `prisma/migrations/0002_add_habit_features/migration.sql` - Migration des colonnes
- ✅ `src/app/api/habits/route.ts` - Filtrage et tri côté API
- ✅ `src/app/api/habits/[id]/route.ts` - Ajout PATCH pour archivage/catégorie
- ✅ `src/components/HabitFilters.tsx` - Composant de filtrage UI
- ✅ `src/components/HabitCardOptions.tsx` - Menu d'options pour habitude
- ✅ `src/app/dashboard/page.tsx` - Intégration des filtres et archivage

**Fonctionnalités implémentées :**
- ✅ **Archivage d'habitudes** - Soft delete avec `isArchived`
- ✅ **Catégories** - Organiser habitudes par catégorie (Sport, Santé, etc.)
- ✅ **Tags** - Support de tags comma-separated
- ✅ **Objectifs personnalisés** - frequency (daily, 3x/week, etc.) + targetDays
- ✅ **Filtres dynamiques** - Par catégorie, avec affichage/masquage archivées
- ✅ **Tri flexible** - Par création, nom, taux de complétion
- ✅ **UI contextuelle** - Menu d'options avec archivage et catégories

**API Updates :**
- `GET /api/habits` - Query params: showArchived, category, sortBy, sortOrder
- `PATCH /api/habits/[id]` - Update isArchived, category, tags, frequency, targetDays

**Résultat :**
✅ **Phase 2 complètement déployée** - Habitudes organisées et archivables
✅ Filtres dynamiques pour meilleures performances
✅ Infrastructure pour objectifs personnalisés (prêt pour Phase 3)
✅ DB propre et cohérente

---

## 📅 24 Octobre 2025 - Session Cleanup & Auto-Logout ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `src/app/api/auth/logout/route.ts` - Supprime les sessions de la DB
- ✅ `src/app/api/auth/stats/route.ts` - Migration `Session.updatedAt` appliquée
- ✅ `prisma/migrations/0001_add_session_updated_at/migration.sql` - Nouvelle colonne
- ✅ `src/lib/hooks/useLogoutOnUnload.ts` - Hook pour logout on page close
- ✅ `src/app/dashboard/page.tsx` - Intégration du hook
- ✅ `.gitignore` - Autoriser les migrations Prisma

**Fonctionnalités implémentées :**
- ✅ **Session supprimée quand page fermée** (événement `beforeunload`)
- ✅ **Auto-logout après 10 min d'inactivité** (no user interaction)
- ✅ **Migration Prisma** pour ajouter `Session.updatedAt`
- ✅ **Hook réutilisable** pour toutes les pages
- ✅ **Compteur utilisateur en temps réel** reflète les déconnexions

**Problèmes résolus :**
- 🔧 Compteur n'affichait pas les changements quand l'utilisateur fermait la page
- 🔧 Sessions fantômes restaient dans la DB indéfiniment
- 🔧 Migration Prisma ignorée par Git (dossier gitignored)
- 🔧 API `/api/auth/stats` retournait erreur 500 (colonne manquante)

**Résultat :**
✅ Compteur "X en ligne / Y inscrits" **100% fonctionnel** en temps réel
✅ Sessions **nettoyées automatiquement** à la fermeture
✅ **Auto-logout** après 10 min sans activité
✅ DB propre et cohérente avec l'UI

---

## 📅 24 Octobre 2025 - Full Mobile Responsiveness ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `src/app/dashboard/page.tsx` - Hamburger menu + responsive nav
- ✅ `src/app/stats/page.tsx` - Mobile-friendly header with menu
- ✅ `src/app/profile/page.tsx` - Responsive profile page
- ✅ `src/app/settings/page.tsx` - Full mobile support + header

**Améliorations implémentées :**
- ✅ **Hamburger Menu** sur tous les pages principales (Dashboard, Stats, Profile, Settings)
- ✅ **Navigation Desktop masquée** sur petits écrans (visible à partir de `md` breakpoint Tailwind)
- ✅ **Navigation Mobile dropdown** qui s'affiche au click sur le burger icon
- ✅ **Headers optimisés** avec texte ajusté pour mobile (plus court, tailles réduites)
- ✅ **ThemeToggle** accessible à la fois en desktop et mobile
- ✅ **Consistent styling** des menus mobiles avec hover effects et dark mode
- ✅ **Settings link** ajouté au dashboard pour accès facile aux paramètres RGPD
- ✅ **Back button** optimisé sur mobile (texte court)

**Problèmes résolus :**
- 🔧 Navigation trop serrée sur smartphone
- 🔧 Texte trop long qui débordait sur petits écrans
- 🔧 Pas d'accès facile au menu sur mobile
- 🔧 ThemeToggle invisible ou mal placé sur mobile

**Résultat :**
✅ Application **totalement responsive** et utilisable sur smartphones
✅ UX mobile améliorée avec navigation fluide
✅ Accès facile à tous les paramètres RGPD
✅ Dark mode et paramètres accessibles partout

---

## 📅 23 Octobre 2025 - Amélioration UX : Rappel Profil Incomplet ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `src/components/ProfileReminder.tsx` - Composant de rappel pour profil incomplet
- ✅ `src/app/dashboard/page.tsx` - Intégration du rappel dans le dashboard

**Fonctionnalités ajoutées :**
- ✅ **Détection automatique** des profils incomplets
- ✅ **Message informatif** avec explication des avantages
- ✅ **Affichage des informations manquantes** (taille, poids, âge, sexe, activité)
- ✅ **Lien direct** vers la page profil pour compléter
- ✅ **Explication des suggestions intelligentes** et leurs avantages
- ✅ **Design responsive** avec dark mode

**Workflow utilisateur :**
1. Utilisateur se connecte → Dashboard
2. Si profil incomplet → Message informatif s'affiche
3. Explication des avantages des suggestions personnalisées
4. Bouton "Compléter mon profil" → Redirection vers /profile
5. Une fois profil complet → Message disparaît automatiquement

**Prochaines étapes :**
→ Phase 3 : Statistiques Avancées (calendrier, heatmap, graphiques)

## 📅 23 Octobre 2025 - Phase 3 : Statistiques Avancées ✅ COMPLÉTÉE

### Modifications
**Fichiers créés/modifiés :**
- ✅ `src/components/MonthlyCalendar.tsx` - Vue calendrier mensuel interactif avec navigation
- ✅ `src/components/HeatmapChart.tsx` - Heatmap annuelle style GitHub avec zoom jour
- ✅ `src/components/AdvancedStatsChart.tsx` - Graphiques avancés (ligne, circulaire, barres)
- ✅ `src/components/DataExport.tsx` - Export CSV, JSON, PDF des données
- ✅ `src/components/SmartInsights.tsx` - Insights IA (meilleurs jours, tendances, suggestions)
- ✅ `src/app/api/habits/calendar/route.ts` - API pour calendrier toutes habitudes
- ✅ `src/app/api/habits/[id]/calendar/route.ts` - API pour calendrier une habitude
- ✅ `src/app/stats/page.tsx` - Page stats globale complète
- ✅ `src/app/dashboard/page.tsx` - Ajout lien vers page stats
- ✅ `src/components/HabitStatsModal.tsx` - Ajout 4 onglets (calendrier, heatmap, insights)

**Fonctionnalités complétées :**
- ✅ **Vue Calendrier Mensuelle** - Navigation, couleurs gradient, légende
- ✅ **Heatmap Annuelle** - Grille 7x53, sélection jour, responsive
- ✅ **Graphiques Avancés** - Tableau comparatif, ligne, circulaire, barres
- ✅ **Export de Données**
  - CSV : Format tabulaire pour Excel/Calc
  - JSON : Format structuré pour API/scripts
  - PDF : Rapport imprimable avec mise en forme
- ✅ **Insights Intelligents IA**
  - Détection meilleur/pire jour
  - Analyse de tendance (comparaison semaine précédente)
  - Suggestions adaptées au niveau de complétion
  - Affichage des stats par jour de semaine
  - Série actuelle et motivation personnalisée
- ✅ **Page Stats Globale** avec tous les graphiques + exports + insights
- ✅ **Intégration Modal** avec 5 onglets complets

**Workflow utilisateur :**
1. Dashboard → "📊 Stats" → Page statistiques complète
2. Consulter calendrier mensuel, heatmap annuelle, comparaisons
3. Recevoir insights IA personnalisés (meilleurs jours, tendances)
4. Exporter données en CSV/JSON/PDF pour analyse/sauvegarde
5. Cliquer habitude → Modal avec tous les détails + insights spécifiques

**Prochaines étapes :**
→ Phase 4 : Social & Communauté (système d'amis, défis, leaderboard)

## 📅 23 Octobre 2025 - Push vers GitHub & Publication ✅

### Modifications
**Repository GitHub :** https://github.com/wilf974/zerah
- ✅ **Initialisation Git** : Repository local configuré
- ✅ **Configuration remote** : Origin pointé vers GitHub
- ✅ **Commit initial** : 66 fichiers, 8,112 lignes de code
- ✅ **Push réussi** : Code publié sur GitHub
- ✅ **Documentation mise à jour** : README avec badges et liens GitHub

**Contenu du repository :**
- ✅ Application complète Zerah avec Phase 3
- ✅ Documentation complète (README, TODO, historique)
- ✅ Configuration Docker optimisée
- ✅ Scripts de déploiement production
- ✅ Code source TypeScript/Next.js
- ✅ Base de données Prisma PostgreSQL

**Statistiques du commit :**
- 66 fichiers ajoutés
- 8,112 lignes de code
- Architecture complète (API, composants, styles, configuration)

**Prochaines étapes :**
→ Phase 4 : Social & Communauté (système d'amis, défis, leaderboard)

## 📅 23 Octobre 2025 - Script de Déploiement Production ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `deploy.sh` - Script de déploiement automatique complet
- ✅ `README.md` - Guide d'installation depuis GitHub
- ✅ `docker-compose.yml` - Optimisation des ports de production
- ✅ Configuration Nginx avec SSL Let's Encrypt

**Fonctionnalités ajoutées :**
- ✅ **Déploiement en une commande** : `sudo bash deploy.sh`
- ✅ **Installation automatique** : Docker, Docker Compose, Nginx, SSL
- ✅ **Configuration sécurisée** : Génération automatique des clés
- ✅ **Configuration SMTP** : Guide pour Gmail et autres providers
- ✅ **Firewall UFW** : Configuration automatique de la sécurité
- ✅ **Monitoring intégré** : Logs et status des services

**Workflow de déploiement :**
1. Clonage du repository GitHub
2. Exécution du script `deploy.sh`
3. Configuration automatique (Docker, Nginx, SSL, firewall)
4. Génération des clés de sécurité
5. Déploiement et migrations Prisma
6. Application accessible en HTTPS

**Script de déploiement inclut :**
- Installation complète de l'environnement
- Configuration Nginx avec reverse proxy
- Certificat SSL Let's Encrypt automatique
- Variables d'environnement sécurisées
- Migrations de base de données
- Configuration du firewall

**Prochaines étapes :**
→ Phase 4 : Social & Communauté (système d'amis, défis, leaderboard)

## 📅 23 Octobre 2025 - Suppression des Références Open-Source ✅

### Modifications
**Fichiers modifiés :**
- ✅ `README.md` - Suppression des badges MIT et mentions open-source
- ✅ `src/app/login/page.tsx` - Modification du texte footer
- ✅ `historique.md` - Mise à jour de la description projet

**Changements apportés :**
- ✅ Suppression du badge "License: MIT" du README
- ✅ Suppression de la section "Licence MIT" 
- ✅ Modification "Application gratuite et open-source" → "Application gratuite"
- ✅ Mise à jour de la description projet dans historique.md
- ✅ Conservation du statut "private: true" dans package.json

**Motivation :**
- Application repositionnée comme projet privé/gratuit
- Suppression des références à l'open-source
- Maintien de la gratuité et accessibilité
- Conservation de la documentation complète

**Prochaines étapes :**
→ Phase 4 : Social & Communauté (système d'amis, défis, leaderboard)

## 📅 23 Octobre 2025 - Conformité RGPD Complète ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `prisma/schema.prisma` - Ajout champs RGPD au modèle User
- ✅ `src/app/privacy/page.tsx` - Page Politique de Confidentialité complète
- ✅ `src/app/terms/page.tsx` - Page Conditions d'Utilisation
- ✅ `src/app/settings/page.tsx` - Dashboard Confidentialité & RGPD
- ✅ `src/components/ConsentBanner.tsx` - Banneau consentement cookies
- ✅ `src/app/api/auth/consent/route.ts` - API gestion consentements
- ✅ `src/app/api/auth/export-data/route.ts` - API export données (Art. 20)
- ✅ `src/app/api/auth/delete-account/route.ts` - API suppression compte (Art. 17)
- ✅ `scripts/cleanup-deleted-accounts.js` - Script nettoyage automatisé
- ✅ `RGPD.md` - Documentation complète RGPD
- ✅ `src/components/RootClientWrapper.tsx` - Intégration ConsentBanner

### Fonctionnalités RGPD implémentées

#### 1. Champs de données RGPD
- ✅ `consentAnalytics` - Consentement analytics
- ✅ `consentMarketing` - Consentement marketing
- ✅ `consentCookies` - Consentement cookies
- ✅ `consentUpdatedAt` - Date mise à jour consentements
- ✅ `dataExportedAt` - Date dernier export
- ✅ `deletionRequestedAt` - Date demande suppression
- ✅ `deletionScheduledFor` - Date suppression programmée (30j)
- ✅ `isDeleted` - Flag soft delete

#### 2. Pages légales
- ✅ **Politique de Confidentialité** (`/privacy`)
  - Détail données collectées
  - Bases légales de traitement
  - Droits RGPD (Art. 15-21)
  - Sécurité et mesures
  - Rétention des données
  - Contacts et réclamations

- ✅ **Conditions d'Utilisation** (`/terms`)
  - Acceptation des conditions
  - Restrictions d'utilisation
  - Propriété intellectuelle
  - Limitation de responsabilité
  - Résiliation de compte
  - Loi applicable

#### 3. Gestion des consentements
- ✅ **ConsentBanner** - Banneau automatique à première visite
  - Vue simple (Accepter tout / Refuser / Paramètres)
  - Vue détaillée (Choix granulaires)
  - Stockage local + base de données
  - Dark mode compatible

- ✅ **API /api/auth/consent**
  - GET : Récupérer consentements utilisateur
  - POST : Mettre à jour consentements
  - Vérification authenticité utilisateur
  - Isolation des données

#### 4. Droit à l'oubli (Art. 17)
- ✅ **API /api/auth/delete-account**
  - POST : Demander suppression (soft delete)
  - GET : Récupérer statut suppression
  - DELETE : Annuler suppression (30j)
  - Période de grâce automatique 30 jours

- ✅ **Processus complet**
  - Jour 0 : Demande de suppression
  - Jours 1-29 : Données conservées, compte inaccessible
  - Jour 30 : Suppression définitive (cron job)
  - Utilisateur peut annuler avant suppression définitive

#### 5. Portabilité des données (Art. 20)
- ✅ **API /api/auth/export-data**
  - Téléchargement JSON complet
  - Inclut : profil, habitudes, entrées, statistiques
  - Métadonnées RGPD
  - Date de dernier export enregistrée

- ✅ **Format export**
  ```json
  {
    "exportDate": "ISO 8601",
    "user": { "id", "email", "profil_santé", "consentements" },
    "habits": [ { "détails", "entrées", "valeurs" } ],
    "sessions": [ { "id", "dates" } ],
    "metadata": { "rgpdCompliant": true }
  }
  ```

#### 6. Dashboard Confidentialité (/settings)
- ✅ **Sections principales**
  - 📥 Exporter mes données (download JSON)
  - 🍪 Gérer les consentements (réafficher banneau)
  - 🗑️ Supprimer mon compte (avec confirmation)
  - 📄 Documents légaux (liens vers pages)

- ✅ **Protection utilisateur**
  - Confirmation en tapant "OUI"
  - Affichage date suppression programmée
  - Option annulation durant 30j
  - Interface sombre/clair
  - Toasts de confirmation

#### 7. Scripts de maintenance
- ✅ **cleanup-deleted-accounts.js**
  - Exécution quotidienne (cron job)
  - Recherche comptes programmés
  - Suppression en cascade (Prisma)
  - Logs d'exécution détaillés
  - Gestion erreurs robuste

#### 8. Documentation RGPD
- ✅ **RGPD.md** complet (20 sections)
  - Vue d'ensemble principes RGPD
  - Détail données collectées
  - Droits utilisateurs (Art. 15-21)
  - Mesures sécurité (HTTPS, chiffrage, auth)
  - Rétention données
  - APIs et endpoints RGPD
  - Consentement et cookies
  - Procédures et contacts
  - Tableau conformité
  - Checklist audit
  - Maintenance cron jobs

### Sécurité RGPD

**Isolation des données :**
- ✅ Chaque utilisateur ne peut accéder qu'à ses propres données
- ✅ Vérification `session.userId === data.userId` systématique
- ✅ Pas d'accès cross-user possible

**APIs sécurisées :**
- ✅ Authentification JWT requise
- ✅ Validation des entrées stricte
- ✅ Gestion erreurs appropriée (401, 403, 404)
- ✅ Rate limiting recommandé

**Chiffrage :**
- ✅ HTTPS/TLS en transit
- ✅ JWT chiffré pour sessions
- ✅ PostgreSQL sur volume persistant
- ✅ Cookies HTTP-only et Secure

### Conformité complète

| Article RGPD | Exigence | Implémentation | Statut |
|--------------|----------|-----------------|--------|
| Art. 13-14 | Information | Politique + banneau | ✅ |
| Art. 15 | Droit d'accès | `/api/auth/export-data` | ✅ |
| Art. 16 | Rectification | Interface profil | ✅ |
| Art. 17 | Oubli | `/api/auth/delete-account` | ✅ |
| Art. 20 | Portabilité | Export JSON | ✅ |
| Art. 21 | Opposition | Gestion consentements | ✅ |
| Art. 32 | Sécurité | HTTPS + chiffrage | ✅ |

### Configuration cron jobs (sur VPS)

À ajouter au `/etc/crontab` du VPS :

```bash
# Suppression comptes programmés (quotidien à minuit)
0 0 * * * cd /opt/apps/zerah && node scripts/cleanup-deleted-accounts.js

# Nettoyage sessions expirées (hebdomadaire)
0 2 * * 0 cd /opt/apps/zerah && npx prisma db execute "DELETE FROM \"Session\" WHERE \"expiresAt\" < NOW()"

# Nettoyage OTP expirés (quotidien)
0 */6 * * * cd /opt/apps/zerah && npx prisma db execute "DELETE FROM \"OTPCode\" WHERE \"expiresAt\" < NOW()"
```

### Workflow utilisateur RGPD

**Exercer ses droits :**
1. Login → Paramètres → Confidentialité
2. Choisir action (export/suppression/consentements)
3. Confirmer l'action
4. Recevoir email confirmation
5. Données traitées (immédiat ou dans 30j)

**Consentements :**
1. Première visite → Banneau automatique
2. Accepter/Refuser/Personnaliser
3. Choix enregistré en local + DB
4. Modifiable via Paramètres → Consentements

**Suppression sécurisée :**
1. Demande → Confirmer (tapez "OUI")
2. Soft delete + notification email
3. 30 jours pour changer d'avis
4. Suppression définitive automatique (jour 30)

### Prochaines étapes

→ Déployer sur VPS avec cron jobs configurés
→ Phase 4 : Social & Communauté (avec contrôles RGPD)

---

## 📅 23 Octobre 2025 - Guide de Mise à Jour VPS & Maintenance ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `README.md` - Ajout du guide de mise à jour VPS complet
- ✅ Documentation des commandes de maintenance production
- ✅ Script de déploiement automatique avec SSL
- ✅ Procédures de sauvegarde et renouvellement SSL

**Fonctionnalités ajoutées :**
- ✅ **Mise à jour en une commande** depuis GitHub
- ✅ **Commande complète** pour déploiement automatisé
- ✅ **Guide de troubleshooting** Docker Compose
- ✅ **Procédures de maintenance** production
- ✅ **Sauvegarde automatique** de la base de données
- ✅ **Renouvellement SSL** Let's Encrypt automatique

**Workflow de mise à jour :**
1. Connexion SSH au VPS
2. Navigation vers le dossier de l'application
3. Pull des modifications depuis GitHub
4. Rebuild et redémarrage des services Docker
5. Vérification des logs et tests

**Commande de mise à jour complète :**
```bash
ssh root@votre-ip-vps "cd /opt/apps/zerah && git pull origin master && docker-compose up -d --build && sleep 30 && docker-compose logs app | tail -10"
```

**Prochaines étapes :**
→ Phase 4 : Social & Communauté (système d'amis, défis, leaderboard)

## 📅 22 Octobre 2025 - Nommage du Projet 🎯
**Projet nommé : ZERAH**
- Zerah est le nom officiel de l'application
- Reposit, source et fichiers de configuration mis à jour
- Le projet est prêt pour sa première version publique

## 📅 22 Octobre 2025 - Phase 2.5 : Intégration Complète des Recommandations Intelligentes ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `src/components/CreateHabitModal.tsx` - Ajout d'onglets pour recommandations, sélection et pré-remplissage
- ✅ `src/app/dashboard/page.tsx` - Chargement du profil utilisateur et passage au modal
- ✅ `src/app/api/habits/route.ts` - Support de création des détails lors de création d'habitude

**Fonctionnalités complétées :**
- ✅ **Deux onglets dans CreateHabitModal**
  - "✏️ Créer manuellement" : création classique
  - "💡 Suggestions" : affichage des recommandations intelligentes
- ✅ **Workflow de sélection de recommandation**
  - Cliquer sur une recommandation pré-remplit le formulaire
  - Affichage du détail configuré (ex: "Verres d'eau")
  - Bouton "Créer avec détail"
- ✅ **Création automatique des détails**
  - Lors de la création, les détails recommandés sont créés automatiquement
  - Les détails s'affichent immédiatement dans HabitCard pour saisie
- ✅ **Chargement du profil au dashboard**
  - Récupération de la hauteur, poids, âge, sexe, niveau d'activité
  - Transmission au modal pour générer les recommandations

**Prochaines étapes :**
→ Phase 3 : Statistiques Avancées (calendrier, heatmap, comparaisons)

## 📅 22 Octobre 2025 - Phase 2.5 : Profil Étendu & Recommandations Intelligentes ✅ COMPLÉTÉE

### Modifications
**Fichiers créés/modifiés :**
- ✅ `prisma/schema.prisma` - Ajout des champs étendus au modèle User (activityLevel, height, weight, gender, age)
- ✅ `src/app/api/auth/profile/route.ts` - API GET/PUT pour profil utilisateur étendu avec validation robuste
- ✅ `src/lib/recommendations.ts` - Utilitaire pour générer recommandations intelligentes d'habitudes
- ✅ `src/components/ExtendedProfileForm.tsx` - Composant UI pour éditer profil de santé (dark mode inclus)
- ✅ `src/components/HabitRecommendations.tsx` - Composant pour afficher recommandations personnalisées

**Fonctionnalités complétées :**
- ✅ Stockage persistant des données de profil étendu (taille, poids, âge, sexe, niveau d'activité)
- ✅ Calcul dynamique des besoins en eau : 30ml/kg + bonus selon activité (0-1500ml supplémentaires)
- ✅ Calcul du sommeil recommandé selon l'âge : 9h (< 18ans) → 8h (adultes) → 7h (> 65ans)
- ✅ Suggestions d'activité physique adaptées au niveau actuel (marche → exercice → maintien)
- ✅ Recommandations multi-domaines (eau, sommeil, exercice, méditation, apprentissage)
- ✅ UI complète avec validation des champs (plages de valeur respectées)
- ✅ Support complet du dark mode dans tous les composants
- ✅ Correction des erreurs ESLint (apostrophes échappées)

**Workflow utilisateur :**
1. Utilisateur se connecte → page Profile
2. Complète formulaire "Profil de Santé" (taille, poids, âge, sexe, activité)
3. Clique "Enregistrer le profil"
4. Les recommandations intelligentes sont générées automatiquement
5. Prêt pour l'intégration dans le modal de création d'habitude

**Prochaines étapes :**
- Afficher les recommandations lors de la création d'une habitude
- Permettre d'ajouter rapidement une habitude recommandée avec détails préconfigurés

---

## 📅 22 Octobre 2025 - Phase 2 : Finalisation (Stats Détaillées) ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `src/app/api/habits/[id]/details-stats/route.ts` - Nouvelle API pour récupérer les stats détaillées (30 derniers jours)
- ✅ `src/components/DetailsStatsChart.tsx` - Nouveau composant pour afficher graphiques et statistiques
- ✅ `src/components/HabitStatsModal.tsx` - Ajout d'onglets pour les stats détaillées et gestion des détails

**Fonctionnalités complétées :**
- API récupère moyenne, total, min, max pour chaque détail
- Graphiques en courbe (LineChart) avec évolution temporelle
- Stats affichées par jour sur 30 jours
- Onglets séparés : Stats générales, Stats détails, Gérer détails
- Support complet du dark mode
- UX optimisée avec loaders et animations

**Résumé Phase 2 :**
✅ Détails personnalisés complets avec API + UI + Stats
✅ Workflow utilisateur fluide (créer → ajouter détails → remplir → consulter stats)

**Prochaines étapes :**
→ Phase 2.5 : Profil étendu avec recommandations intelligentes

## 📅 22 Octobre 2025 - Phase 2 : API Détails Personnalisés

### Modifications
**Fichiers créés/modifiés :**
- ✅ `prisma/schema.prisma` - Ajout des modèles HabitDetail et HabitEntryValue (COMPLÉTÉ lors du démarrage Phase 2)
- ✅ `src/app/api/habits/[id]/details/route.ts` - Routes GET/POST pour gérer les détails
- ✅ `src/app/api/habits/[id]/details/[detailId]/route.ts` - Route DELETE pour supprimer les détails
- ✅ `src/app/api/habits/[id]/entries/values/route.ts` - Routes POST/GET pour sauvegarder les valeurs des détails
- ✅ `src/components/HabitDetailsForm.tsx` - Composant pour ajouter des détails (Nombre, Durée, Distance, Personnalisé)
- ✅ `src/components/HabitEntryDetailsInput.tsx` - Composant pour saisir les valeurs avec boutons rapides

**Fonctionnalités :**
- API complète pour gérer les détails personnalisés d'une habitude
- Stockage des valeurs précises avec date
- Composants React pour l'interface utilisateur
- Support de 4 types de détails : Nombre, Durée, Distance, Personnalisé
- Validation et authentification à chaque endpoint

**Prochaines étapes :**
- Intégrer les composants dans le modal de création d'habitude
- Intégrer le composant de saisie lors du check-in
- Afficher les statistiques détaillées par jour

## 📅 22 Octobre 2025 - Création du MVP

### Contexte
Création d'une application web de suivi d'habitudes (habit tracker) gratuite. L'objectif est de fournir une solution simple, efficace et auto-hébergeable pour aider les utilisateurs à développer de meilleures habitudes quotidiennes.

### Architecture Technique Choisie

**Stack :**
- Frontend/Backend : Next.js 15 avec App Router
- Base de données : PostgreSQL 16
- ORM : Prisma
- Authentification : OTP par email (code à 6 chiffres)
- Styling : Tailwind CSS
- Graphiques : Recharts
- Déploiement : Docker + Docker Compose

**Ports :**
- PostgreSQL : 10001
- Application Next.js : 2000

### Fichiers Créés

#### Configuration de Base
- `package.json` : Dépendances et scripts npm
- `docker-compose.yml` : Orchestration des services (PostgreSQL + App)
- `Dockerfile` : Build multi-stage pour Next.js en production
- `.dockerignore` : Exclusions pour le build Docker
- `.gitignore` : Exclusions Git
- `.env` : Variables d'environnement (SMTP, DB, secrets)
- `tsconfig.json` : Configuration TypeScript
- `tailwind.config.ts` : Configuration Tailwind CSS
- `next.config.ts` : Configuration Next.js (standalone output)

#### Base de Données
- `prisma/schema.prisma` : Schéma complet avec 5 modèles
  - User : Utilisateurs de l'application
  - OTPCode : Codes de connexion temporaires
  - Session : Sessions utilisateur
  - Habit : Habitudes créées par les utilisateurs
  - HabitEntry : Entrées quotidiennes pour chaque habitude

#### Backend / API

**Authentification :**
- `src/lib/session.ts` : Gestion des sessions JWT avec jose (encrypt, decrypt, createSession, deleteSession, getSession)
- `src/lib/dal.ts` : Data Access Layer avec verifySession cachée
- `src/lib/email.ts` : Génération OTP et envoi d'emails via Nodemailer
- `src/app/api/auth/send-otp/route.ts` : API d'envoi du code OTP
- `src/app/api/auth/verify-otp/route.ts` : API de vérification du code et création de session
- `src/app/api/auth/logout/route.ts` : API de déconnexion
- `src/middleware.ts` : Middleware Next.js pour protéger les routes

**Habitudes :**
- `src/lib/prisma.ts` : Client Prisma singleton
- `src/app/api/habits/route.ts` : GET (liste) et POST (création)
- `src/app/api/habits/[id]/route.ts` : DELETE (suppression)
- `src/app/api/habits/[id]/entries/route.ts` : POST (marquer fait) et DELETE (supprimer entrée)
- `src/app/api/habits/[id]/stats/route.ts` : GET (statistiques : streak, taux de complétion, graphiques 30 jours)

#### Frontend / UI

**Pages :**
- `src/app/layout.tsx` : Layout global avec métadonnées
- `src/app/page.tsx` : Page d'accueil avec présentation et CTA
- `src/app/login/page.tsx` : Page de connexion OTP en 2 étapes (email puis code)
- `src/app/dashboard/page.tsx` : Dashboard principal avec liste des habitudes
- `src/app/globals.css` : Styles globaux Tailwind

**Composants :**
- `src/components/HabitCard.tsx` : Carte d'habitude avec bouton de coche
- `src/components/CreateHabitModal.tsx` : Modal de création d'habitude (nom, description, icône, couleur)
- `src/components/HabitStatsModal.tsx` : Modal avec statistiques et graphique Recharts

### Fonctionnalités Implémentées

#### Authentification OTP
- Système sans mot de passe
- Envoi de code à 6 chiffres par email
- Validité de 10 minutes
- Invalidation automatique des anciens codes
- Session chiffrée dans cookie HTTP-only (7 jours)

#### Gestion des Habitudes
- Création avec nom, description (optionnel), icône, couleur
- Liste des habitudes personnelles
- Suppression avec confirmation
- 12 icônes prédéfinies
- 12 couleurs prédéfinies

#### Suivi Journalier
- Coche pour marquer comme fait aujourd'hui
- Décoche pour annuler
- Feedback visuel immédiat
- Sauvegarde en base de données

#### Statistiques
- Série actuelle (current streak) en jours consécutifs
- Total de complétions
- Taux de complétion du mois en cours
- Graphique des 30 derniers jours (BarChart)
- Messages de motivation conditionnels

### Principes Appliqués

**Clean Code :**
- Fonctions commentées avec JSDoc
- Noms de variables explicites
- Séparation des responsabilités (DAL, session, email)
- DRY : Réutilisation du verifySession
- KISS : Logique simple et directe
- YAGNI : Pas de sur-engineering

**Sécurité :**
- Sessions JWT chiffrées
- Cookies sécurisés (httpOnly, secure en prod)
- Validation des entrées utilisateur
- Vérification de propriété des ressources
- Middleware de protection des routes

**Docker :**
- Multi-stage build optimisé
- Volume persistant pour PostgreSQL
- Réseau bridge interne
- Variables d'environnement externalisées

### Décisions Techniques

1. **Next.js App Router** : Choisi pour les Server Components et l'architecture moderne
2. **Prisma** : ORM type-safe avec migrations déclaratives
3. **OTP vs Password** : Plus simple, pas de gestion de mot de passe oublié
4. **JWT local vs session DB** : Performance (pas de requête DB à chaque vérification)
5. **Standalone output** : Pour Docker production optimisé
6. **Recharts** : Librairie de graphiques légère et React-friendly

### Prochaines Étapes Suggérées

Voir `TODO.md` pour la roadmap complète.

**Priorités court terme :**
- Tests utilisateurs
- Corrections de bugs éventuels
- Amélioration UX (toasts, loaders)
- Mode sombre

**Priorités moyen terme :**
- PWA avec notifications push
- Vue calendrier avancée
- Statistiques étendues

**Priorités long terme :**
- Fonctionnalités sociales
- Application mobile
- Module premium

---

**Fichiers de suivi :**
- `README.md` : Documentation complète d'installation et utilisation
- `TODO.md` : Roadmap détaillée par phases
- `historique.md` : Ce fichier (contexte et décisions)

**État actuel :** MVP complet et fonctionnel ✅

## 📅 22 Octobre 2025 - Phase 2.6 : Compteur d'Eau Personnalisé ✅

### Modifications
**Fichiers créés/modifiés :**
- ✅ `src/components/CustomWaterCounter.tsx` - Nouveau composant pour le compteur d'eau personnalisé
- ✅ `src/components/WaterCounterModal.tsx` - Modal pour gérer le compteur d'eau
- ✅ `src/app/api/water-entries/route.ts` - Routes GET/POST pour sauvegarder les entrées d'eau
- ✅ `src/app/api/water-entries/[id]/route.ts` - Routes GET/PUT/DELETE pour gérer les entrées d'eau

**Fonctionnalités complétées :**
- ✅ Compteur d'eau personnalisé avec saisie de quantité et date
- ✅ Modal pour gérer les entrées d'eau
- ✅ Affichage des statistiques d'eau sur le dashboard
- ✅ Support du dark mode
- ✅ Validation des entrées utilisateur

**Prochaines étapes :**
- Intégrer le compteur d'eau dans le modal de création d'habitude
- Afficher les statistiques d'eau dans les détails d'une habitude

