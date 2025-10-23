# 🎯 Zerah - Suivi d'Habitudes Personnalisé

Application web gratuite et open-source de suivi d'habitudes avec profil de santé personnalisé et recommandations intelligentes.

[![GitHub Repository](https://img.shields.io/badge/GitHub-wilf974%2Fzerah-blue?style=flat&logo=github)](https://github.com/wilf974/zerah)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Deploy](https://img.shields.io/badge/Deploy-VPS%20HTTPS-green.svg)](https://github.com/wilf974/zerah#déploiement-en-production)

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
- 🚀 **Déploiement Production** : Script automatisé avec HTTPS et SSL

## ⚡ Déploiement Rapide

```bash
# Cloner et déployer en une commande
git clone https://github.com/wilf974/zerah.git && cd zerah
sudo bash deploy.sh  # Déploiement automatique avec HTTPS
```

**L'application sera accessible sur https://zerah.woutils.com**

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
# Cloner depuis GitHub
git clone https://github.com/wilf974/zerah.git
cd zerah

# Vérifier que tous les fichiers sont présents
ls -la
```

### 2. Configuration Automatisée (Recommandé)

Pour un déploiement rapide, utilisez le script automatisé :

```bash
# Télécharger le script de déploiement
wget https://raw.githubusercontent.com/wilf974/zerah/master/deploy.sh

# Rendre le script exécutable
chmod +x deploy.sh

# Exécuter le déploiement automatique
sudo bash deploy.sh
```

Le script va automatiquement :
- ✅ Installer Docker et Docker Compose
- ✅ Configurer Nginx avec SSL (Let's Encrypt)
- ✅ Générer les clés de sécurité
- ✅ Configurer les variables d'environnement
- ✅ Démarrer l'application
- ✅ Configurer le firewall

### 3. Configuration Manuelle (Alternative)

```bash
# Copier et configurer les variables d'environnement
cp .env.example .env
nano .env  # Configurer vos vraies valeurs SMTP

# Démarrer les services
docker-compose up -d

# Attendre PostgreSQL
sleep 15

# Migrations
docker exec zerah-app npx prisma migrate deploy
docker exec zerah-app npx prisma generate

# Redémarrer l'application
docker-compose restart app
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

### Sur VPS Debian/Ubuntu avec HTTPS

#### 1. Configuration Système de Base

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les outils de base
sudo apt install -y curl wget git nano ufw

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session
newgrp docker
```

#### 2. Configuration DNS

```bash
# Ajouter l'enregistrement A dans votre zone DNS :
# zerah.woutils.com → VOTRE_IP_VPS

# Vérifier la propagation DNS
nslookup zerah.woutils.com
```

#### 3. Installation de l'Application

```bash
# Cloner le repository
git clone https://github.com/wilf974/zerah.git
cd zerah

# Configurer les variables d'environnement
nano .env
```

#### 4. Configuration .env

Créez le fichier `.env` avec la configuration suivante :

```bash
# Créer le fichier .env
nano .env
```

**Configuration recommandée pour la production :**

```env
# Base de données (générée automatiquement par le script)
DATABASE_URL="postgresql://zerah_user:STRONG_PASSWORD@localhost:10001/zerah_db?schema=public"

# Sécurité (générée automatiquement)
SESSION_SECRET="your-super-secret-session-key-min-32-chars"

# Configuration SMTP OBLIGATOIRE (pour l'authentification OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-application-gmail"
SMTP_FROM="Zerah <votre-email@gmail.com>"

# URL de production
NEXT_PUBLIC_APP_URL="https://zerah.woutils.com"
```

**Variables importantes pour la production :**

```env
# Base de données
DATABASE_URL="postgresql://zerah_user:STRONG_PASSWORD@localhost:10001/zerah_db?schema=public"

# Sessions (générer une clé forte)
SESSION_SECRET="your-super-secret-session-key-min-32-chars"

# Email SMTP (obligatoire pour l'authentification OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-application"
SMTP_FROM="Zerah <votre-email@gmail.com>"

# URLs de production
NEXT_PUBLIC_APP_URL="https://zerah.woutils.com"
```

#### 5. Configuration HTTPS avec Nginx

```bash
# Installer Nginx et Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Configurer Nginx
sudo nano /etc/nginx/sites-available/zerah
```

**Configuration Nginx :**

```nginx
server {
    listen 80;
    server_name zerah.woutils.com;

    # Redirection HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name zerah.woutils.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/zerah.woutils.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zerah.woutils.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy vers l'application Docker
    location / {
        proxy_pass http://localhost:2000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/zerah /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d zerah.woutils.com

# Configurer le renouvellement automatique
sudo systemctl enable certbot.timer
```

#### 6. Configuration Docker

```bash
# Modifier les ports dans docker-compose.yml si nécessaire
nano docker-compose.yml
```

**Ports de production :**
```yaml
services:
  db:
    ports:
      - "10001:5432"  # PostgreSQL sur port externe
  app:
    ports:
      - "2000:3000"   # Next.js sur port interne
```

#### 7. Démarrage de l'Application

```bash
# Démarrer les services
docker-compose up -d

# Attendre que PostgreSQL démarre
sleep 10

# Entrer dans le conteneur pour les migrations
docker exec -it zerah-app sh

# À l'intérieur du conteneur :
npx prisma migrate deploy
npx prisma generate
exit

# Redémarrer l'application
docker-compose restart app
```

#### 8. Configuration du Firewall

```bash
# Configurer UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Vérifier le statut
sudo ufw status
```

#### 9. Monitoring et Logs

```bash
# Vérifier les logs
docker-compose logs -f app
docker-compose logs -f db

# Vérifier l'état des services
docker-compose ps

# Redémarrer si nécessaire
docker-compose restart
```

#### 10. Maintenance

```bash
# Mettre à jour l'application
git pull origin master
docker-compose up -d --build

# Sauvegarde de la base de données
docker exec zerah-db pg_dump -U zerah_user zerah_db > backup_zerah_$(date +%Y%m%d).sql

# Renouvellement SSL automatique (déjà configuré avec certbot)
sudo certbot renew --dry-run
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

