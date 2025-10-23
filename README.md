# 🎯 Zerah - Suivi d'Habitudes Personnalisé

Application web gratuite et open-source de suivi d'habitudes avec profil de santé personnalisé et recommandations intelligentes.

## 🚀 Fonctionnalités

- ✅ **Suivi simple** : Cochez vos habitudes chaque jour
- 📊 **Statistiques** : Séries, taux de complétion, graphiques des 30 derniers jours
- 🔐 **Authentification OTP** : Connexion sécurisée par code email à 6 chiffres
- 🎨 **Personnalisation** : Icônes et couleurs personnalisables
- 📱 **Responsive** : Interface optimisée mobile et desktop
- 🐳 **Full Docker** : Déploiement facile avec Docker Compose
- 📈 **Statistiques Avancées** : Calendrier mensuel, Heatmap style GitHub, Graphiques annuels
- 💡 **Insights IA** : Meilleurs jours, tendances, suggestions personnalisées
- 📥 **Export de Données** : CSV, JSON, PDF pour analyse et sauvegarde
- 🎯 **Suggestions Intelligentes** : Recommandations adaptées à votre profil de santé

## 🛠️ Stack Technique

- **Frontend/Backend** : Next.js 15 (App Router)
- **Base de données** : PostgreSQL 16
- **ORM** : Prisma
- **Authentification** : JWT avec jose + OTP par email
- **UI** : Tailwind CSS + Recharts
- **Déploiement** : Docker + Docker Compose

## 📦 Installation

### Prérequis

- Docker et Docker Compose
- Node.js 20+ (pour développement local)

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd zerah
```

### 2. Configuration

Copiez le fichier `.env.example` vers `.env` et configurez vos variables :

```bash
cp .env.example .env
```

**Variables importantes :**

- `DATABASE_URL` : URL de connexion PostgreSQL
- `SESSION_SECRET` : Clé secrète pour les sessions (min. 32 caractères)
- `SMTP_*` : Configuration SMTP pour l'envoi des codes OTP

**Pour Gmail :**
1. Activez la validation en deux étapes
2. Générez un "mot de passe d'application" : https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `SMTP_PASS`

### 3. Démarrage avec Docker

```bash
# Démarrer les conteneurs
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les conteneurs
docker-compose down
```

L'application sera accessible sur : **http://localhost:2000**

### 4. Migrations de base de données

```bash
# Entrer dans le conteneur
docker exec -it habit-tracker-app sh

# Lancer les migrations
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

## 💻 Développement Local

### Installation des dépendances

```bash
npm install
```

### Démarrer PostgreSQL seul

```bash
docker-compose up postgres -d
```

### Lancer le serveur de développement

```bash
npm run dev
```

### Migrations Prisma

```bash
# Créer une migration
npm run prisma:migrate

# Ouvrir Prisma Studio
npm run prisma:studio
```

## 🏗️ Structure du Projet

```
habit-tracker/
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── src/
│   ├── app/
│   │   ├── api/               # Routes API
│   │   │   ├── auth/          # Authentification OTP
│   │   │   └── habits/        # Gestion des habitudes
│   │   ├── dashboard/         # Page principale
│   │   ├── login/             # Page de connexion
│   │   └── layout.tsx         # Layout global
│   ├── components/            # Composants React
│   │   ├── HabitCard.tsx
│   │   ├── CreateHabitModal.tsx
│   │   └── HabitStatsModal.tsx
│   └── lib/                   # Utilitaires
│       ├── prisma.ts          # Client Prisma
│       ├── session.ts         # Gestion des sessions
│       ├── email.ts           # Envoi d'emails
│       └── dal.ts             # Data Access Layer
├── docker-compose.yml         # Configuration Docker
├── Dockerfile                 # Image Next.js
└── package.json
```

## 🔒 Sécurité

- Sessions chiffrées avec JWT (jose)
- Cookies HTTP-only et Secure en production
- Codes OTP valides 10 minutes
- Middleware de protection des routes
- Validation des entrées utilisateur

## 📊 API Routes

### Authentification

- `POST /api/auth/send-otp` : Envoyer un code OTP
- `POST /api/auth/verify-otp` : Vérifier le code et se connecter
- `POST /api/auth/logout` : Se déconnecter

### Habitudes

- `GET /api/habits` : Liste des habitudes
- `POST /api/habits` : Créer une habitude
- `DELETE /api/habits/[id]` : Supprimer une habitude
- `POST /api/habits/[id]/entries` : Marquer comme fait
- `DELETE /api/habits/[id]/entries?date=YYYY-MM-DD` : Supprimer une entrée
- `GET /api/habits/[id]/stats` : Statistiques d'une habitude
- `GET /api/habits/calendar` : Calendrier toutes habitudes
- `GET /api/habits/[id]/calendar` : Calendrier d'une habitude
- `GET /api/habits/[id]/details-stats` : Stats détaillées d'une habitude
- `GET/POST/DELETE /api/habits/[id]/details` : Gérer les détails personnalisés

## 🚢 Déploiement en Production

### Sur VPS Debian

```bash
# 1. Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Cloner le projet
git clone <votre-repo>
cd habit-tracker

# 3. Configurer .env (avec vraies valeurs SMTP)
nano .env

# 4. Démarrer
docker-compose up -d

# 5. Migrations
docker exec -it habit-tracker-app sh
npx prisma migrate deploy
```

### Ports

- PostgreSQL : `10001`
- Application : `2000`

## 🤝 Contribution

Ce projet est open-source et gratuit. Les contributions sont les bienvenues !

## ❤️ Soutien

Si vous aimez ce projet, vous pouvez le soutenir via PayPal : [Lien PayPal]

## 📝 Licence

MIT License - Libre d'utilisation

## 🎯 Roadmap (Extensions futures)

- [ ] Notifications push web (PWA)
- [x] Mode sombre
- [ ] Communauté / défis entre amis
- [x] Statistiques avancées
- [x] Export de données (CSV, PDF)
- [x] Intégration calendrier
- [ ] Application mobile (React Native)
- [ ] Rappels par email personnalisables

---

Développé avec ❤️ pour aider à développer de meilleures habitudes

