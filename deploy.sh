#!/bin/bash

# Script de déploiement automatique pour Zerah Habit Tracker
# Usage: sudo bash deploy.sh

set -e

echo "🚀 Déploiement de Zerah Habit Tracker sur zerah.woutils.com"

# Vérifier les privilèges root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Ce script doit être exécuté en tant que root (sudo)"
  exit 1
fi

# Configuration des variables
APP_NAME="zerah"
DOMAIN="zerah.woutils.com"
DB_PASSWORD=$(openssl rand -hex 16)
SESSION_SECRET=$(openssl rand -hex 32)

echo "📋 Configuration:"
echo "   Domaine: $DOMAIN"
echo "   Base de données: zerah_db"
echo "   Ports: PostgreSQL=10001, App=2000"

# 1. Mise à jour du système
echo "🔄 Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation des outils de base
echo "📦 Installation des outils de base..."
apt install -y curl wget git nano ufw software-properties-common

# 3. Installation de Docker
echo "🐳 Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
fi

# 4. Installation de Docker Compose
echo "🐳 Installation de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 5. Installation de Nginx et Certbot
echo "🌐 Installation de Nginx et Certbot..."
apt install -y nginx certbot python3-certbot-nginx

# 6. Configuration DNS (rappel)
echo "📡 Configuration DNS requise:"
echo "   Ajoutez l'enregistrement A dans votre zone DNS:"
echo "   $DOMAIN → $(curl -s ifconfig.me)"
echo ""
read -p "Appuyez sur Entrée une fois la configuration DNS effectuée..."

# 7. Clonage du repository
echo "📥 Clonage du repository..."
if [ -d "$APP_NAME" ]; then
    echo "   Repository déjà présent, mise à jour..."
    cd $APP_NAME
    git pull origin master
else
    git clone https://github.com/wilf974/zerah.git
    cd $APP_NAME
fi

# 8. Configuration des variables d'environnement
echo "⚙️ Configuration des variables d'environnement..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Générer et afficher les configurations importantes
echo "   Mot de passe base de données généré: $DB_PASSWORD"
echo "   Clé de session générée: $SESSION_SECRET"
echo ""

# Mettre à jour le fichier .env
sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://zerah_user:$DB_PASSWORD@localhost:10001/zerah_db?schema=public\"|" .env
sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=\"$SESSION_SECRET\"|" .env
sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"https://$DOMAIN\"|" .env

echo "✅ Variables d'environnement configurées"
echo "⚠️  IMPORTANT: Configurez vos paramètres SMTP dans le fichier .env"
echo "   SMTP_HOST, SMTP_USER, SMTP_PASS sont requis pour l'authentification"

# 9. Configuration Nginx
echo "🌐 Configuration de Nginx..."
cat > /etc/nginx/sites-available/zerah << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Redirection HTTP vers HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activer le site Nginx
ln -sf /etc/nginx/sites-available/zerah /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 10. Obtention du certificat SSL
echo "🔒 Obtention du certificat SSL..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email jean.maillot14@gmail.com

# 11. Configuration du firewall
echo "🔥 Configuration du firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "✅ Firewall configuré"

# 12. Démarrage de l'application
echo "🚀 Démarrage de l'application..."
docker-compose up -d

# 13. Attendre que PostgreSQL démarre
echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 15

# 14. Migrations Prisma
echo "🗄️ Exécution des migrations..."
docker exec zerah-app npx prisma migrate deploy
docker exec zerah-app npx prisma generate

# 15. Redémarrage de l'application
echo "🔄 Redémarrage de l'application..."
docker-compose restart app

# 16. Vérification finale
echo "✅ Vérification de l'installation..."
echo ""
echo "📊 Status des services:"
docker-compose ps
echo ""
echo "🌐 Test HTTPS:"
curl -I https://$DOMAIN
echo ""
echo "📝 Résumé de l'installation:"
echo "   ✅ Docker et Docker Compose installés"
echo "   ✅ Nginx configuré avec SSL (Let's Encrypt)"
echo "   ✅ Firewall UFW configuré"
echo "   ✅ Application démarrée sur https://$DOMAIN"
echo "   ✅ Base de données migrée"
echo ""
echo "⚠️  ACTIONS REQUISES:"
echo "   1. Configurez vos paramètres SMTP dans le fichier .env"
echo "   2. Redémarrez l'application: docker-compose restart app"
echo "   3. Testez l'application sur https://$DOMAIN"
echo ""
echo "🔧 Commandes de maintenance:"
echo "   - Logs: docker-compose logs -f"
echo "   - Redémarrer: docker-compose restart"
echo "   - Mettre à jour: git pull && docker-compose up -d --build"
echo ""
echo "🎉 Déploiement terminé !"
echo "📧 L'application sera accessible sur https://$DOMAIN"
