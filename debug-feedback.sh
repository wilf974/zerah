#!/bin/bash

echo "=== DEBUG FEEDBACK API ==="
echo ""

# 1. Vérifier que le conteneur app est en cours d'exécution
echo "1. État du conteneur app:"
docker-compose ps app
echo ""

# 2. Vérifier les logs récents
echo "2. Logs récents du conteneur app (dernières 50 lignes):"
docker-compose logs app | tail -50
echo ""

# 3. Tester la connexion à la base de données
echo "3. Vérifier la connexion PostgreSQL:"
docker-compose exec app npx prisma db execute "SELECT 1"
echo ""

# 4. Vérifier que la table Feedback existe
echo "4. Vérifier que la table Feedback existe:"
docker-compose exec app npx prisma db execute "SELECT COUNT(*) as feedback_count FROM \"Feedback\""
echo ""

# 5. Vérifier les variables d'environnement critiques
echo "5. Variables d'environnement (SESSION_SECRET et DATABASE_URL):"
docker-compose exec app sh -c 'echo "SESSION_SECRET: ${SESSION_SECRET:0:10}..." && echo "DATABASE_URL: ${DATABASE_URL}"'
echo ""

# 6. Vérifier les migrations appliquées
echo "6. Migrations Prisma:"
docker-compose exec app npx prisma migrate status
echo ""

# 7. Vérifier la structure de la table Feedback
echo "7. Structure de la table Feedback:"
docker-compose exec app npx prisma db execute "SELECT * FROM information_schema.columns WHERE table_name = 'Feedback'"
echo ""

# 8. Vérifier s'il y a des erreurs dans les logs du build
echo "8. Vérifier les logs d'erreur récents:"
docker-compose logs app 2>&1 | grep -i "error\|fail\|exception" | tail -20
echo ""

echo "=== FIN DEBUG ==="
