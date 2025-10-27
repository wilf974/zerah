# 🔍 Guide Debug - API Feedback

Exécute ces commandes sur ton VPS pour diagnostiquer le problème avec l'API feedback.

## 1️⃣ Vérifier l'état des conteneurs

```bash
cd /opt/apps/zerah
docker-compose ps
```

**Attendu:** Les conteneurs `zerah-app` et `zerah-db` doivent être en état `Up`

---

## 2️⃣ Vérifier les logs de l'application

```bash
docker-compose logs app | tail -100
```

**À chercher:** Erreurs, exceptions, messages de startup

---

## 3️⃣ Vérifier la connexion PostgreSQL

```bash
docker-compose exec app npx prisma db execute "SELECT 1 as test"
```

**Attendu:** `test: 1`

---

## 4️⃣ Vérifier que la table Feedback existe

```bash
docker-compose exec app npx prisma db execute "SELECT COUNT(*) as count FROM \"Feedback\""
```

**Attendu:** `count: 0` (ou un nombre)

---

## 5️⃣ Lister toutes les tables de la DB

```bash
docker-compose exec app npx prisma db execute "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
```

**Attendu:** Doit inclure `Feedback`, `User`, `Habit`, `Session`, etc.

---

## 6️⃣ Vérifier la structure de la table Feedback

```bash
docker-compose exec app npx prisma db execute "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Feedback' ORDER BY ordinal_position"
```

**Attendu:** Colonnes: id, userId, title, description, category, status, createdAt, updatedAt

---

## 7️⃣ Vérifier les variables d'environnement

```bash
docker-compose exec app sh -c 'echo "DATABASE_URL=$DATABASE_URL" && echo "SESSION_SECRET=${SESSION_SECRET:0:20}..."'
```

**Attendu:** Les variables doivent être définies

---

## 8️⃣ Afficher le statut des migrations

```bash
docker-compose exec app npx prisma migrate status
```

**Attendu:** Toutes les migrations doivent être appliquées (checkmark ✓)

---

## 9️⃣ Reconstruire les conteneurs (si rien ne marche)

```bash
cd /opt/apps/zerah
docker-compose down
docker system prune -f
git pull origin master
docker-compose up -d --build
sleep 30
docker-compose exec app npx prisma migrate deploy
```

---

## 🔟 Tester l'API sans authentification (devrait retourner 401)

```bash
curl -s https://zerah.woutils.com/api/feedback | jq .
```

**Attendu:** `{"error":"Authentification requise"}`

---

## Checklist de debugging

- [ ] Les conteneurs sont en état `Up`
- [ ] Pas d'erreurs dans les logs
- [ ] PostgreSQL répond à SELECT 1
- [ ] La table `Feedback` existe
- [ ] La table a les 8 colonnes attendues
- [ ] Les variables d'environnement sont définies
- [ ] Toutes les migrations sont appliquées
- [ ] L'API retourne 401 sans authentification

Si tout ça passe, le problème vient probablement de:
- Session/JWT invalide
- Cookie non envoyé correctement
- Erreur dans le parsing du token

---

## 📝 Si tu trouves une erreur

Partage le output de cette commande:

```bash
docker-compose logs app | tail -200
```

Ça montrera les erreurs de l'application!
