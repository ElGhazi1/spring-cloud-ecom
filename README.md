# Projet microservices - Keycloak demo 🚀

Ce dépôt contient un mini-projet micro-services (React + Spring Boot + Keycloak) destiné à l'apprentissage et au TP.
Le projet inclut :
- Frontend React (SPA) authentifié via Keycloak
- API Gateway (Spring Cloud Gateway) validant les JWT
- Micro-services Product et Order (Spring Boot, JWT-protected)
- Base en mémoire H2 pour développement

---

## 🧰 Prérequis
- Java 21, Maven
- Node.js + npm
- Docker & Docker Compose (recommandé pour lancer Keycloak)
- Ou Keycloak installé localement

---

## 🐳 Démarrage rapide avec Docker Compose (Recommandé)
Le projet inclut un fichier `docker-compose.yml` qui démarre automatiquement Keycloak avec PostgreSQL et importe le realm `ecom`.

1. **Démarrer Keycloak avec Docker Compose** :
```bash
docker-compose up -d
```

2. **Vérifier que les services sont démarrés** :
```bash
docker-compose ps
```

3. **Accéder à Keycloak** :
   - URL : http://localhost:8080
   - Admin username : `admin`
   - Admin password : `admin`
   - Le realm `ecom` est importé automatiquement !

4. **Arrêter les services** :
```bash
docker-compose down
```

5. **Arrêter et supprimer les volumes (données)** :
```bash
docker-compose down -v
```

**Note** : Le fichier `docker-compose.yml` inclut :
- **PostgreSQL** : Base de données pour Keycloak (persistance)
- **Keycloak** : Import automatique du realm `ecom` depuis `ecom-realm.json`
- Health checks pour s'assurer que les services sont prêts

---

## 🔐 Keycloak — exporter / importer le realm (Manuel)
Pour faciliter la configuration de votre environnement, un export du realm `ecom` est fourni (fichier `ecom-realm.json`).

- Import via l'interface Keycloak (si vous n'utilisez pas Docker Compose) : Realm → **Add realm** → **Select file** → Import `ecom-realm.json`.

- Remarques importantes :
  - **Ne publiez pas** de secrets (client secrets, mots de passe) dans un dépôt public. Si vous placez `ecom-realm.json` dans Git, redactionnez ou stockez le fichier dans un privé.
  - Vérifiez après import : clients `ecom-frontend` (public) et `ecom-backend` (confidential), rôles `ADMIN` et `CLIENT`, utilisateurs (`admin`, `client`) et leurs affectations.

---

## ▶️ Lancer les services (dev, chacun dans son terminal)
Note : si `./mvnw` renvoie `Permission denied`, exécutez `chmod +x mvnw` dans chaque module.

- Gateway (port 8085)
```bash
cd gateway && ./mvnw spring-boot:run
```

- Product service (port 8081)
```bash
cd product-service && ./mvnw spring-boot:run
```

- Order service (port 8082)
```bash
cd order-service && ./mvnw spring-boot:run
```

- Frontend React (port 3000)
```bash
cd react-app
npm ci
npm start
```

---

## ✅ Points utiles / URLs
- Frontend : http://127.0.0.1:3000
- Gateway : http://127.0.0.1:8085
  - Routes : `/products/**` -> product service, `/orders/**` -> order service
- Product service H2 console : http://127.0.0.1:8081/h2-console (JDBC URL: `jdbc:h2:mem:productdb`)
- Keycloak (admin) : http://127.0.0.1:8080 (realm `ecom`)

---

## 🧪 Tests rapides (après login via le frontend)
- Obtenir un token : connectez-vous dans le navigateur via le frontend et copiez l'Access Token depuis `keycloak.token` dans la console JavaScript (ou utilisez la REST API pour obtenir un token).

- Exemple : lister produits (via Gateway)
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://127.0.0.1:8085/products
```

- Exemple : créer produit (ADMIN)
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"name":"Nom","description":"Desc","price":12.5,"quantity":10}' \
  http://127.0.0.1:8085/products
```

---

## 🔒 Règles de sécurité
- Le Gateway valide les JWT et centralise la sécurité. Les micro-services vérifient également les rôles (ADMIN/CLIENT).
- Frontend : **ecom-frontend** (client public) utilise PKCE (Standard Flow).
- Backend : **ecom-backend** (confidential) pour usage côté serveur si nécessaire.

---

## 🐞 Dépannage rapide
- Erreur *Invalid parameter: redirect_uri* → vérifier que `Valid Redirect URIs` & `Web Origins` du client frontend contiennent `http://127.0.0.1:3000/*` et `http://127.0.0.1:3000`.
- React : si `react-scripts: Permission denied` → `rm -rf node_modules && npm ci` puis `chmod +x node_modules/.bin/react-scripts` si nécessaire.
- 403 sur API → vérifiez que le token contient `realm_access.roles` et que l’utilisateur a le rôle attendu.

---

## 🛡️ Sécurité & Analyse de Code

Ce projet inclut un workflow GitHub Actions complet pour l'analyse de sécurité :

### 🔍 Outils Intégrés

1. **CodeQL** - Analyse statique native GitHub (SAST)
   - Détection de vulnérabilités de sécurité dans Java et JavaScript
   - Analyse sémantique avancée du code
   - Intégration native avec GitHub Security tab
   - Pas de configuration serveur nécessaire

2. **Semgrep** - Analyse SAST moderne et rapide
   - Détection de patterns de sécurité dangereux
   - Règles pré-configurées pour OWASP Top 10
   - Support Java, JavaScript, React, Docker
   - Résultats en temps réel

3. **ESLint** - Analyse de code JavaScript/React
   - Détection de problèmes de qualité et sécurité
   - Règles spécifiques à React
   - Analyse statique du code frontend

4. **OWASP Dependency-Check** - Analyse des dépendances
   - Détection de CVEs dans les dépendances Maven et npm
   - Génération de rapports SARIF pour GitHub Security
   - Seuil configurable (CVSS ≥ 7 par défaut)

5. **Trivy** - Scan des images Docker
   - Analyse des vulnérabilités dans les images Docker
   - Détection des failles OS et applicatives
   - Rapports pour chaque service (gateway, product, order, react-app)

### 📖 Documentation

- **[Guide de Configuration](SECURITY_WORKFLOW_SETUP.md)** - Configuration complète et premiers pas
- **[Référence Rapide](SECURITY_QUICK_REFERENCE.md)** - Commandes et aide-mémoire
- **[Documentation Workflow](.github/workflows/README.md)** - Détails techniques du workflow

### 🚀 Démarrage Rapide

1. **Aucune configuration serveur nécessaire !** 
   - CodeQL, Semgrep et ESLint fonctionnent directement dans GitHub Actions
   - Pas besoin de SONAR_TOKEN ou SONAR_HOST_URL

2. Le workflow s'exécute automatiquement sur :
   - Push vers `main`, `master`, ou `develop`
   - Pull Requests
   - Planification hebdomadaire (lundi 00:00 UTC)
   - Déclenchement manuel

3. Consultez les résultats :
   - **GitHub Security Tab** : Alertes CodeQL, Semgrep, OWASP et Trivy
   - **Code Scanning Alerts** : Vulnérabilités détaillées avec suggestions de correction
   - **Workflow Artifacts** : Rapports détaillés HTML/JSON

### ✨ Avantages des Nouveaux Outils

- ✅ **Zéro Configuration** - Pas de serveur SonarQube à configurer
- ✅ **Gratuit pour Projets Publics** - Tous les outils sont gratuits sur GitHub
- ✅ **Intégration Native** - Résultats directement dans GitHub Security
- ✅ **Analyse Rapide** - Résultats en quelques minutes
- ✅ **Suggestions de Correction** - CodeQL fournit des exemples de code corrigé

Pour plus d'informations, consultez le [guide de configuration complet](SECURITY_WORKFLOW_SETUP.md).

---

## 📚 Contribuer
- Ajoutez issues/PR pour les nouvelles fonctionnalités (Orders UI, tests, Docker compose, CI/CD, sécurité scans).
- Assurez-vous que tous les tests de sécurité passent avant de soumettre une PR.
- Documentez toute suppression de vulnérabilité dans les fichiers de configuration appropriés.

---

Si vous voulez, j'ajoute un petit script `scripts/start-all.sh` pour lancer tous les modules en parallèle en mode dev, ou j'ajoute `ecom-realm.json` dans un dossier `keycloak/` du repo (en masquant les secrets). Dites‑moi ce que vous préférez.