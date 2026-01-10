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
- Keycloak (dev) accessible sur `http://127.0.0.1:8080`
- (Optionnel) Docker si vous préférez lancer Keycloak via conteneur

---

## 🔐 Keycloak — exporter / importer le realm
Pour faciliter la configuration de votre environnement, un export du realm `ecom` est fourni (fichier `ecom-realm.json`).

- Import via l'interface Keycloak (recommandé) : Realm → **Add realm** → **Select file** → Import `ecom-realm.json`.

- Import via Docker (fast start, import automatique) :
```bash
docker run --rm -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v $(pwd)/ecom-realm.json:/tmp/ecom-realm.json \
  quay.io/keycloak/keycloak:latest start-dev --import-realm
```

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

## 📚 Contribuer
- Ajoutez issues/PR pour les nouvelles fonctionnalités (Orders UI, tests, Docker compose, CI/CD, sécurité scans).

---

Si vous voulez, j'ajoute un petit script `scripts/start-all.sh` pour lancer tous les modules en parallèle en mode dev, ou j'ajoute `ecom-realm.json` dans un dossier `keycloak/` du repo (en masquant les secrets). Dites‑moi ce que vous préférez.