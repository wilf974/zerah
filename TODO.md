# TODO - Zerah (Suivi d'Habitudes Personnalisé)

## ✅ MVP Complété

- [x] Initialisation du projet (package.json, Docker, configurations)
- [x] Configuration Prisma avec schéma PostgreSQL
- [x] Système d'authentification OTP par email
- [x] Interface dashboard avec gestion des habitudes
- [x] Suivi journalier et statistiques
- [x] Documentation complète (README, historique)

## 🚀 Phase 1 : Améliorations UX ✅ COMPLÉTÉE

- [x] Ajouter un loader lors des requêtes API
- [x] Toast notifications pour les actions (succès/erreur)
- [x] Mode sombre
- [x] Animation de confettis lors de série de 7+ jours
- [x] Page de profil utilisateur (modifier nom, email)

### Phase 2 : Fonctionnalités Avancées ✅ COMPLÉTÉE
- [x] Vue calendrier mensuel interactif (HeatmapChart)
- [x] Filtres et tri des habitudes (HabitFilters component)
- [x] Archivage d'habitudes (isArchived soft delete)
- [x] Tags/catégories pour habitudes (category field)
- [x] Objectifs personnalisés (frequency + targetDays)
- [x] **Détails personnalisés par habitude** (eau: ml/verres, exercice: durée/distance, etc.)
  - [x] Schéma Prisma avec HabitDetail et HabitEntryValue
  - [x] API pour créer/modifier les détails d'une habitude
  - [x] Composant UI pour ajouter des détails lors de la création d'habitude
  - [x] Composant UI pour saisir les valeurs lors du check-in
  - [x] Affichage des statistiques détaillées

### Phase 2.5 : Profil Étendu & Recommandations Intelligentes ✅ COMPLÉTÉE
- [x] **Ajouter champs au profil utilisateur**
  - [x] `activity_level` : sédentaire, modéré, actif, très actif
  - [x] `height` : taille (cm)
  - [x] `weight` : poids (kg)
  - [x] `gender` : homme, femme, autre (pour calculs personnalisés)
  - [x] `age` : optionnel
- [x] **API pour profil étendu** (`/api/auth/profile`)
- [x] **UI pour compléter le profil** dans la page Profile
- [x] **Utilitaire recommandations intelligentes** (`generateHabitRecommendations`)
  - [x] Template "Eau" : calcul ml/jour selon taille + poids
  - [x] Template "Sport" : suggestions durée selon niveau d'activité
  - [x] Template "Sommeil" : suggestions heures selon âge + activité
  - [x] Templates "Méditation" et "Apprentissage"
- [x] **Workflow création d'habitude**
  - [x] Afficher recommandations dans CreateHabitModal
  - [x] Option pour ajouter une habitude recommandée avec ses détails préconfigurés
  - [x] Création automatique des détails lors de l'ajout d'une habitude recommandée

### Phase 2.6 : Compteur d'Eau Personnalisé 🔄 EN COURS
- [x] Afficher les infos de santé dans le profil
- [x] Intégrer ExtendedProfileForm dans la page profil
- [x] Compteur d'eau intelligent (verres calculés selon poids/activité)
- [x] Barre de progression pour l'objectif d'eau
- [x] Boutons rapides (-1, +1 verre, +5 verres, ✓ Valider)
- [x] Sauvegarde automatique du nombre de verres bu

### Phase 3 : Statistiques Avancées ✅ COMPLÉTÉE
- [x] Vue calendrier mensuel interactif
- [x] Heatmap de complétion (style GitHub)
- [x] Graphiques annuels
- [x] Comparaison de plusieurs habitudes
- [x] Export de données (CSV, JSON, PDF)
- [x] Insights IA (meilleurs jours, suggestions)

### Phase 4 : Social & Communauté ✅ COMPLÉTÉE
- [x] Partage de succès sur réseaux sociaux
- [x] **Système d'amis** ✅
  - [x] Modèle Prisma Friendship (senderId, receiverId, status)
  - [x] Migration 0004_add_friendship
  - [x] API `/api/friends` (GET, POST, PATCH, DELETE)
  - [x] API `/api/friends/search` pour recherche d'utilisateurs
  - [x] Page `/friends` avec onglets (Mes amis, Demandes, Rechercher)
  - [x] Composant UI complet avec recherche, gestion des demandes
  - [x] Intégration dans la navigation (desktop + mobile)
- [x] **Défis entre utilisateurs** ✅
  - [x] Modèle Prisma Challenge et ChallengeParticipant
  - [x] Migration 0005_add_challenges
  - [x] API `/api/challenges` (GET, POST)
  - [x] API `/api/challenges/[id]` (GET, PATCH, DELETE)
  - [x] API `/api/challenges/[id]/sync-progress` pour synchroniser automatiquement
  - [x] Page `/challenges` avec onglets (Mes Défis, Créés par moi, Créer)
  - [x] Système d'invitation et acceptation
  - [x] Suivi des progrès en temps réel
  - [x] Modal détaillé avec classement des participants
  - [x] Intégration dans la navigation
- [x] **Tableau de classement (leaderboard)** ✅
  - [x] API `/api/leaderboard` avec calcul des scores
  - [x] Métriques : habits actives, taux complétion, streak, total completions
  - [x] Filtres temporels (semaine, mois, tout temps)
  - [x] Page `/leaderboard` avec podium top 3
  - [x] Liste complète avec scores et rangs
  - [x] Mise en évidence de l'utilisateur connecté
  - [x] Support du dark mode
  - [x] Intégration dans la navigation
- [x] **Forums/discussions par habitude** ✅
  - [x] Modèle Prisma Discussion et Comment
  - [x] Migration 0006_add_discussions
  - [x] API `/api/discussions` (GET, POST) avec filtres
  - [x] API `/api/discussions/[id]` (GET, PATCH, DELETE)
  - [x] API `/api/discussions/[id]/comments` (GET, POST, DELETE)
  - [x] Page `/discussions` avec liste et création
  - [x] Système de commentaires imbriqués (réponses)
  - [x] Compteur de vues automatique
  - [x] Liens avec habitudes spécifiques
  - [x] Support du dark mode complet
  - [x] Intégration dans la navigation

### Phase 5 : Notifications
- [ ] Service Worker pour PWA
- [ ] Notifications push web
- [ ] Rappels par email personnalisables
- [ ] Résumés hebdomadaires/mensuels par email

### Phase 6 : Mobile & Performance
- [ ] Application mobile (React Native)
- [ ] Mode hors-ligne (Service Worker)
- [ ] Optimisation des images
- [ ] Cache amélioré
- [ ] Tests E2E (Playwright)

### Phase 7 : Admin & Monétisation
- [ ] Panel admin
- [ ] Analytics utilisateurs (respect RGPD)
- [ ] Module premium (optionnel)
- [ ] Intégration Stripe pour dons récurrents
- [ ] Templates d'habitudes prédéfinies

### Phase 8 : Système de Suggestions & Feedback
- [x] Page "Soumettre une idée" accessible aux utilisateurs
- [x] Formulaire : Titre + Description + Catégorie (Bug/Feature/UX/Other)
- [x] Stockage des suggestions en base de données
- [x] **Notification email** à jean.maillot14@gmail.com à chaque nouvelle idée
- [x] Panel utilisateur pour voir ses idées soumises
- [ ] Système de vote/likes sur les idées (future)
- [ ] Page publique des meilleures idées (future)

## 🐛 Bugs Connus

_Aucun bug signalé pour le moment_

## 💡 Idées en Vrac

- Intégration avec Google Calendar / Notion
- Widget pour site web
- Extension navigateur
- Gamification (badges, niveaux)
- Méditation guidée intégrée
- Citations motivantes quotidiennes
- Support multilingue (i18n)
- Mode "focus" sans distractions
- Synchronisation inter-appareils
- Backup automatique des données

## ✨ Améliorations UX Implémentées

- ✅ **Rappel profil incomplet** : Message informatif si informations de santé manquantes
- ✅ **Suggestions intelligentes** : Recommandations adaptées au profil utilisateur
- ✅ **Onboarding progressif** : Guide utilisateur pour compléter son profil
- ✅ **Responsive Mobile** : Navigation hamburger menu sur petits écrans

---

**Dernière mise à jour** : 10 novembre 2025 - Phase 4 : Forums/Discussions ✅
- ✅ Système de discussions complet pour la communauté
- ✅ Modèles Prisma Discussion et Comment avec relations
- ✅ Migration 0006_add_discussions
- ✅ API REST complète : GET/POST /api/discussions, /api/discussions/[id], /api/discussions/[id]/comments
- ✅ Filtrage par habitude, statut (open/closed), tri (récent/populaire)
- ✅ Page /discussions avec onglets (Liste, Créer, Détails)
- ✅ Formulaire de création avec sélection d'habitude optionnelle
- ✅ Système de commentaires imbriqués avec réponses
- ✅ Compteur de vues automatique
- ✅ Support complet du dark mode
- ✅ Navigation intégrée (💬 Forums dans desktop + mobile)
- ✅ Phase 4 Social & Communauté 100% complète ! 🎉

