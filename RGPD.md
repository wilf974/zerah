# 🔐 Conformité RGPD - Zerah Habit Tracker

**Document de conformité au Règlement Général sur la Protection des Données (RGPD)**

Date de mise à jour : Octobre 2025
Responsable du traitement : Zerah Habit Tracker

---

## 📋 Table des Matières

1. [Vue d'ensemble RGPD](#vue-densemble-rgpd)
2. [Données personnelles collectées](#données-personnelles-collectées)
3. [Droits des utilisateurs](#droits-des-utilisateurs)
4. [Mesures de sécurité](#mesures-de-sécurité)
5. [Rétention des données](#rétention-des-données)
6. [APIs et endpoints](#apis-et-endpoints)
7. [Consentement](#consentement)
8. [Contacts et procédures](#contacts-et-procédures)

---

## Vue d'ensemble RGPD

### Principes appliqués

Zerah respecte les principes fondamentaux du RGPD :

✅ **Licéité, loyauté et transparence** : Collecte légale et information claire
✅ **Minimisation des données** : Collecte uniquement ce qui est nécessaire
✅ **Exactitude** : Maintien de la qualité des données
✅ **Intégrité et confidentialité** : Protection sécurisée des données
✅ **Responsabilité** : Démonstration de la conformité

### Données non partagées

🔒 **Les données ne concerne que l'utilisateur qui les demande/partage**

Aucune donnée n'est :
- Partagée avec des tiers (sauf services essentiels)
- Vendue ou commercialisée
- Utilisée à des fins de profilage commercial
- Transférée vers des pays tiers sans garanties
- Stockées au-delà de la période nécessaire

---

## Données personnelles collectées

### 1. Données d'identification

| Type | Description | Base légale |
|------|-------------|-------------|
| Email | Adresse email unique | Contrat (authentification) |
| Nom | Nom optionnel | Contrat (profil) |

### 2. Profil de santé

| Type | Description | Base légale |
|------|-------------|-------------|
| Taille | En centimètres | Consentement (recommandations) |
| Poids | En kilogrammes | Consentement (recommandations) |
| Âge | En années | Consentement (recommandations) |
| Genre | Homme/Femme/Autre | Consentement (recommandations) |
| Activité | Niveau d'activité physique | Consentement (recommandations) |

### 3. Données d'habitudes

| Type | Description | Base légale |
|------|-------------|-------------|
| Habitudes | Nom, description, icône, couleur | Contrat (service) |
| Entrées | Dates de complétion | Contrat (service) |
| Détails | Mesures personnalisées (ml, min, km) | Contrat (service) |
| Statistiques | Calculs et graphiques | Contrat (service) |

### 4. Données techniques

| Type | Description | Durée |
|------|-------------|-------|
| Cookies de session | Authentification, préférences | 7 jours |
| Cookies analytiques | Utilisation (optionnel) | 13 mois |
| Adresse IP | Logs serveur | 90 jours |
| User-Agent | Type d'appareil | 90 jours |

### 5. Consentements RGPD

| Type | Description |
|------|-------------|
| Analytics | Consentement pour Google Analytics |
| Marketing | Consentement pour emails marketing |
| Cookies | Consentement pour cookies non-essentiels |

---

## Droits des utilisateurs

### Art. 15 - Droit d'accès

**Demander une copie de vos données :**

```bash
# API
GET /api/auth/export-data

# Interface
Paramètres → Confidentialité → Exporter mes données
```

**Fichier JSON contenant :**
- Profil utilisateur complet
- Toutes les habitudes
- Tous les historiques d'entrées
- Statistiques personnalisées
- Consentements

### Art. 16 - Droit de rectification

**Modifier vos données :**

1. **Profil** : Paramètres → Profil → Modifier
2. **Habitudes** : Dashboard → Cliquer sur l'habitude → Éditer
3. **Données personnelles** : Email via la page de profil

### Art. 17 - Droit à l'oubli

**Supprimer votre compte :**

```bash
# API - Demander la suppression
POST /api/auth/delete-account

# API - Récupérer le statut
GET /api/auth/delete-account

# API - Annuler la suppression
DELETE /api/auth/delete-account

# Interface
Paramètres → Confidentialité → Supprimer mon compte
```

**Processus de suppression :**

1. **Jour 0** : Demande de suppression (soft delete)
2. **Jours 1-30** : Période de grâce (données conservées, compte inaccessible)
3. **Jour 30** : Suppression définitive via cron job

### Art. 20 - Droit à la portabilité

**Exporter vos données :**

- Format : JSON structuré
- Inclut : Profil, habitudes, statistiques, consentements
- Téléchargement via API ou interface
- Réutilisable pour import ailleurs

### Art. 21 - Droit d'opposition

**Gérer vos consentements :**

```bash
# API
POST /api/auth/consent
GET /api/auth/consent

# Interface
Paramètres → Confidentialité → Gérer les consentements
```

Vous pouvez à tout moment :
- Accepter/refuser les analytics
- Accepter/refuser le marketing
- Retirer votre consentement

---

## Mesures de sécurité

### 1. Chiffrage en transit

✅ **HTTPS/TLS 1.3** sur tous les endpoints
✅ **Certificat SSL** Let's Encrypt
✅ **HSTS** pour forcer HTTPS
✅ **CSP** (Content Security Policy)

### 2. Chiffrage au repos

✅ **PostgreSQL** sur volume persistant
✅ **Cookies HTTP-only** (XSS protection)
✅ **Secure flag** sur cookies
✅ **SameSite=Strict** pour CSRF

### 3. Authentification

✅ **OTP par email** (pas de mot de passe)
✅ **JWT chiffré** avec jose
✅ **Sessions signées** avec vérification
✅ **Rate limiting** sur endpoints sensibles

### 4. Autorisations

✅ **Vérification de propriété** sur chaque requête
✅ **Isolation des données** par utilisateur
✅ **Validation des entrées** stricte
✅ **Middleware d'authentification** complet

### 5. Infrastructure

✅ **Firewall UFW** configuré
✅ **Docker** pour isolation
✅ **Reverse proxy Nginx**
✅ **Logs structurés** pour audit
✅ **Monitoring** des services

---

## Rétention des données

### Comptes actifs

| Donnée | Durée | Justification |
|--------|-------|---------------|
| Profil utilisateur | Durée du compte | Fourniture du service |
| Habitudes/Entrées | Durée du compte | Historique utilisateur |
| Sessions | 7 jours | Authentification |
| OTP | 10 minutes | Sécurité |
| Logs serveur | 90 jours | Sécurité et audit |

### Comptes supprimés

| Donnée | Durée | Raison |
|--------|-------|--------|
| Données marquées | 30 jours | Droit de rétractation (RGPD) |
| Suppression définitive | Après 30 jours | Nettoyage automatisé |

### Gestion automatisée

Un cron job exécute quotidiennement :

```bash
# Recherche comptes programmés pour suppression
SELECT * FROM "User" 
WHERE deletionScheduledFor <= NOW() 
AND isDeleted = false

# Suppression en cascade complète
DELETE FROM "User" WHERE id = userId
-- Supprime automatiquement : Session, Habit, HabitEntry, etc.
```

---

## APIs et endpoints

### Consentement

```bash
# Récupérer les consentements
GET /api/auth/consent

# Mettre à jour les consentements
POST /api/auth/consent
{
  "consentAnalytics": boolean,
  "consentMarketing": boolean,
  "consentCookies": boolean
}
```

### Export de données

```bash
# Télécharger l'export JSON
GET /api/auth/export-data

# Retour : Fichier JSON avec toutes les données
{
  "exportDate": "2025-10-23T10:30:00Z",
  "user": { /* profil */ },
  "habits": [ /* habitudes */ ],
  "metadata": { "rgpdCompliant": true }
}
```

### Suppression de compte

```bash
# Demander la suppression
POST /api/auth/delete-account
# Retour : { success, deletionScheduledFor (30 jours) }

# Récupérer le statut
GET /api/auth/delete-account
# Retour : { deletionStatus, hasActiveDeletionRequest }

# Annuler la suppression
DELETE /api/auth/delete-account
# Retour : { success }
```

### Sécurité des APIs

Toutes les APIs :
- ✅ Nécessitent authentification (JWT)
- ✅ Isolent les données par utilisateur authentifié
- ✅ Validé les entrées
- ✅ Retournent 401 si non authentifié
- ✅ Retournent 403 si pas de droit d'accès

---

## Consentement

### Banneau de consentement

À la première visite, un banneau s'affiche :

1. **Vue simple** : Accepter tout / Refuser tout / Paramètres
2. **Vue détaillée** : Choix granulaire pour chaque type

### Cookies configurés

```javascript
// Essentiels (toujours activés, pas de consentement)
session // Authentification utilisateur
csrf_token // Protection contre CSRF
preferences // Préférences d'interface

// Analytiques (consentement requis)
_ga // Google Analytics (si accepté)

// Marketing (consentement requis)
marketing_consent // Emails marketing (si accepté)
```

### Stockage du consentement

```json
{
  "gdpr-consent-given": {
    "analytics": boolean,
    "marketing": boolean,
    "cookies": boolean,
    "timestamp": "ISO 8601"
  }
}
```

Plus mis à jour dans la base de données :

```prisma
User {
  consentAnalytics: Boolean
  consentMarketing: Boolean
  consentCookies: Boolean
  consentUpdatedAt: DateTime
}
```

---

## Contacts et procédures

### Responsable du traitement

**Email** : Disponible dans l'application
**Adresse** : Hébergé en Europe (VPS Debian)

### Exercer vos droits

**Procédure complète :**

1. Connectez-vous à votre compte Zerah
2. Allez dans **Paramètres → Confidentialité**
3. Choisissez l'action souhaitée :
   - 📥 Exporter mes données
   - 🍪 Gérer les consentements
   - 🗑️ Supprimer mon compte
4. Confirmez par email si nécessaire
5. Recevez confirmation et données

### Délais de réponse

- **Export de données** : Immédiat (téléchargement)
- **Modification de données** : Immédiat (via interface)
- **Suppression de compte** : 30 jours + imméd ieur de rétractation
- **Réclamation** : Selon autorité locale

### Réclamation auprès d'une autorité

Si vous estimez que vos droits ne sont pas respectés :

1. **France** : CNIL (cnil.fr)
2. **Autres pays UE** : Autorité de protection des données locale
3. **Processus** : Déposer une plainte formelle avec documentation

---

## Tableau de conformité

| Article RGPD | Exigence | Implémentation | Statut |
|--------------|----------|-----------------|--------|
| Art. 13-14 | Info privacy | Politique + banneau consentement | ✅ |
| Art. 15 | Droit d'accès | `/api/auth/export-data` | ✅ |
| Art. 16 | Rectification | Interface profil + API | ✅ |
| Art. 17 | Oubli | `/api/auth/delete-account` 30j | ✅ |
| Art. 18 | Limitation | Soft delete avec période grâce | ✅ |
| Art. 20 | Portabilité | Export JSON structuré | ✅ |
| Art. 21 | Opposition | Gestion consentements fine | ✅ |
| Art. 32 | Sécurité | HTTPS, chiffrage, auth OTP | ✅ |
| Art. 33-34 | Notification | Procédures en place | ✅ |
| Art. 35 | DPIA | Documentation complète | ✅ |

---

## Checklist d'audit RGPD

- ✅ Politique de confidentialité claire et accessible
- ✅ Conditions d'utilisation légales
- ✅ Consentement explicite pour données sensibles
- ✅ Droit d'accès, rectification, suppression implémentés
- ✅ Export de données disponible
- ✅ Chiffrage en transit (HTTPS/TLS)
- ✅ Chiffrage au repos (volumes PostgreSQL)
- ✅ Authentification sécurisée (OTP)
- ✅ Sessions chiffrées (JWT)
- ✅ Isolation des données par utilisateur
- ✅ Rétention définie et respectée
- ✅ Nettoyage automatisé des données supprimées
- ✅ Audit trails des actions sensibles
- ✅ Aucun partage de données avec tiers
- ✅ Infrastructure en Europe

---

## Maintenance RGPD

### Cron jobs à configurer

**Suppression des comptes programmés** (quotidien) :
```bash
0 0 * * * cd /opt/apps/zerah && node scripts/cleanup-deleted-accounts.js
```

**Nettoyage des sessions expirées** (hebdomadaire) :
```bash
0 2 * * 0 cd /opt/apps/zerah && npx prisma db execute "DELETE FROM \"Session\" WHERE \"expiresAt\" < NOW()"
```

**Nettoyage des OTP expirés** (quotidien) :
```bash
0 */6 * * * cd /opt/apps/zerah && npx prisma db execute "DELETE FROM \"OTPCode\" WHERE \"expiresAt\" < NOW()"
```

### Monitoring

Vérifiez régulièrement :
- Comptes en attente de suppression
- Sessions actives vs expirées
- Conformité des consentements
- Intégrité des données

---

## Dernières mises à jour

- **23 Oct 2025** : Implémentation complète du RGPD
  - Schéma Prisma mis à jour
  - APIs RGPD complètes
  - Interface Settings RGPD
  - Banneau de consentement
  - Script de nettoyage
  - Documentation complète

---

## Questions ?

Consultez :
- 🔐 Politique de Confidentialité : `/privacy`
- ⚖️ Conditions d'Utilisation : `/terms`
- ⚙️ Paramètres RGPD : `/settings` (connecté)

**Ce document garantit la conformité RGPD complète de Zerah Habit Tracker.**

🔒 **Vos données vous appartiennent. Vous en avez le contrôle complet.**
