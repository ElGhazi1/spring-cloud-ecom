# Q&A TECHNIQUES - SÉCURITÉ AVEC KEYCLOAK & DEVSECOPS

---

## 🔐 SECTION 1 : KEYCLOAK - AUTHENTIFICATION & AUTORISATION

### Q1. C'est quoi OpenID Connect et OAuth2 au niveau de Keycloak ?

**Réponse courte :**
- **OAuth2** : Protocole d'autorisation (accès aux ressources). Keycloak = serveur d'autorisation.
- **OpenID Connect (OIDC)** : Couche d'authentification au-dessus d'OAuth2 (qui est l'utilisateur ?).
- **Au projet** : Keycloak combine les deux = authentification + autorisation via tokens JWT.
- **Flux** : User → Keycloak (login) → Token JWT → Accès aux APIs

---

### Q2. Comment on a implémenté les règles d'autorisation au niveau de l'API Gateway ?

**Réponse courte :**
- **Fichier** : [GatewaySecurityConfig.java](gateway/src/main/java/ma/enset/gateway/config/GatewaySecurityConfig.java#L18)
- **Mécanisme** : 
  - `@EnableWebFluxSecurity` = activation sécurité Gateway (reactive stack)
  - Validation JWT obligatoire : `anyExchange().authenticated()` = tout est protégé (ZERO TRUST)
  - Extraction rôles Keycloak : `realm_access.roles` → convertis en autorités Spring (`ROLE_ADMIN`, `ROLE_CLIENT`)
- **CORS centralisé** : Frontend React autorisé uniquement (`http://localhost:3000`)
- **Pas de logique métier** dans la Gateway ✓

---

### Q3. Comment on a implémenté les règles d'autorisation au niveau de chaque micro-service ?

**Réponse courte :**
- **Order-Service** : [SecurityConfig.java](order-service/src/main/java/ma/enset/orderservice/config/SecurityConfig.java)
- **Product-Service** : [SecurityConfig.java](product-service/src/main/java/ma/enset/productservice/config/SecurityConfig.java)
- **Défense en profondeur** :
  - Chaque service vérifie les tokens JWT indépendamment
  - `@EnableMethodSecurity` = contrôle d'accès au niveau des méthodes via `@PreAuthorize`
  - Endpoints publics exemptés (Swagger) : `permitAll()`
  - Tout le reste : `authenticated()`
- **Même extraction de rôles** que la Gateway : `realm_access.roles` → autorités

---

### Q4. Comment on a centralisé les règles de sécurité ?

**Réponse courte :**
1. **Source unique** : Keycloak (ecom-realm.json)
   - Rôles définis centralement : ADMIN, CLIENT
   - Utilisateurs assignés aux rôles chez Keycloak
2. **Propagation via JWT** : Token contient `realm_access.roles` = rôles de l'utilisateur
3. **Configuration centralisée** :
   - Gateway + Services pointent vers même issuer : `http://keycloak:8080/realms/ecom`
   - Même validation JWT partout
4. **Résultat** : Modifier un rôle chez Keycloak = changement immédiat partout ✓

---

### Q5. Quelle est la différence entre les rôles ADMIN et CLIENT ?

**Réponse courte :**
- **ADMIN** : Accès complet (créer, lire, modifier, supprimer)
- **CLIENT** : Accès restreint (lire propres données, créer commandes)
- **Assignation** : Fait dans Keycloak (realm)
- **Contrôle** : Avec `@PreAuthorize("hasRole('ADMIN')")` ou `hasRole('CLIENT')`

---

### Q6. Comment les tokens JWT sont validés dans le projet ?

**Réponse courte :**
1. **Frontend** : Appelle Gateway
2. **Gateway** : Vérifie JWT (signature + expiration)
3. **Services** : Vérifient JWT indépendamment
4. **Configuration** : 
   - Clé publique récupérée depuis Keycloak
   - Validation automatique via Spring Security OAuth2
5. **Rejet** : Token invalide/expiré = 401 Unauthorized

---

### Q7. Comment on a sécurisé la communication service-to-service ?

**Réponse courte :**
- **Actuel** : Services peuvent s'appeler directement (réseau Docker privé = sécurisé par réseau)
- **Meilleure pratique** : 
  - Passer par Gateway (JWT transmis)
  - OU utiliser JWT service-to-service + signatures
- **Notre approche** : Chaque service valide JWT = couche de sécurité supplémentaire ✓

---

### Q8. Qu'est-ce qui se passe si le token JWT expire ?

**Réponse courte :**
1. Request avec token expiré arrive
2. Spring Security OAuth2 détecte expiration
3. Réponse : `401 Unauthorized`
4. Frontend : Appelle endpoint de refresh OU redirige vers login Keycloak
5. Frontend obtient nouveau token et réessaie

---

## 🔑 SECTION 2 : API GATEWAY (Spring Cloud Gateway)

### Q9. Comment on a appliqué les mécanismes JWT dans la Gateway ?

**Réponse courte :**
- **Dépendance** : `spring-boot-starter-oauth2-resource-server`
- **Configuration** (application.yml) :
  ```yaml
  spring.security.oauth2.resourceserver.jwt.issuer-uri: http://keycloak:8080/realms/ecom
  ```
- **Validation** : Spring configure automatiquement la chaîne de validation JWT
- **Extraction rôles** : Via `JwtGrantedAuthoritiesConverter`
- **Résultat** : Chaque requête validée avant routage ✓

---

### Q10. Comment on a rendu la Gateway = seul point d'entrée ?

**Réponse courte :**
- **Architecture** :
  ```
  React (:3000) → Gateway (:8085) → Product-Service (:8081)
                                  → Order-Service (:8082)
  ```
- **Frontend** : Appelle uniquement Gateway (`http://localhost:8085`)
- **Routage** (application.yml) :
  - `/products/**` → Product-Service
  - `/orders/**` → Order-Service
- **Avantage** : Service Discovery transparent, load-balancing, sécurité centralisée

---

### Q11. Est-ce qu'on a mis des configs au niveau de la React App ?

**Réponse courte :**
- **Oui** : [keycloak.js](react-app/src/keycloak.js)
  ```javascript
  const keycloak = new Keycloak({
      url: "http://localhost:8080",
      realm: "ecom",
      clientId: "ecom-frontend",
  });
  ```
- **Rôle** : Initialise la connexion avec Keycloak
- **Flux** : 
  1. React = client OIDC
  2. Appelle Keycloak (login)
  3. Reçoit token JWT
  4. Envoie token dans headers des requêtes à Gateway
- **Sécurité** : CORS strictement limité à Gateway

---

### Q12. Qu'est-ce qu'il se passe si on désactive la Gateway ?

**Réponse courte :**
- Services = non accessibles directement du frontend (par design)
- Frontend ferait des appels CORS-blocked vers services
- Résultat : Application cassée + faille de sécurité (pas de validation centralisée)
- **Solution** : Gate doit TOUJOURS être opérationnel (passer par load-balancer, K8s, etc.)

---

### Q13. Comment on a géré les erreurs d'authentification dans la Gateway ?

**Réponse courte :**
- **Configuration** : CSRF désactivé (Gateway reçoit tokens CORS-safe)
- **JWT invalide** : Spring Security retourne automatiquement `401 Unauthorized`
- **Réponse** : JSON error ou redirect vers Keycloak
- **Frontend** : Capture 401 → logout utilisateur + redirect login

---

## 🛡️ SECTION 3 : DEVSECOPS

### Q14. Est-ce qu'on a activé les actions de sécurité sur le repo ?

**Réponse courte :**
**OUI** - Fichier : [security-analysis.yml](.github/workflows/security-analysis.yml)

Outils activés :
- **CodeQL** : SAST (GitHub native) pour Java + JavaScript
- **Semgrep** : SAST supplémentaire (OWASP Top 10, security-audit, Docker)
- **OWASP Dependency-Check** : Analyse des dépendances (CVE)

---

### Q15. Est-ce qu'on a ajouté des configurations dans les Dockerfiles pour les outils de sécurité ?

**Réponse courte :**
**INDIRECTEMENT - Oui**, au niveau des images de base + runtime :

**1. Gateway Dockerfile** :
- `apk upgrade` = mise à jour sécurité Alpine (patches CVE)
- Non-root user (`appuser:1001`) = isolation
- Image Alpine ultra-légère = moins de vulnérabilités

**2. Services (Order/Product) Dockerfile** :
- Même principe : Alpine, `apk upgrade`, non-root user
- Build multi-stage = moins de couches vulnérables

**3. React App Dockerfile** :
- Nginx ultra-léger (`nginx:1.27-alpine`)
- Non-root user (`nginx`)
- `apk upgrade` pour sécurité

**4. Docker-Compose** :
- Images de base patchées
- Variables env pour Keycloak
- Health checks = détecte services non-fonctionnels

---

### Q16. Qu'est-ce qu'on pourrait ajouter pour scanner les images Docker ?

**Réponse courte :**
**Trivy** (scanner d'images Docker) :

```yaml
# À ajouter au workflow GitHub Actions
- name: Run Trivy scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'gateway:latest'
    format: 'sarif'
    output: 'trivy.sarif'
```

**Ou** : scanner les images après `docker build` localement :
```bash
trivy image gateway:latest
```

---

### Q17. Comment on a structuré l'analyse OWASP Dependency-Check ?

**Réponse courte :**
- **Workflow** : Scanne chaque service (Gateway, Product, Order)
- **Commande** : `mvn org.owasp:dependency-check-maven:check`
- **Sortie** : Rapports HTML → `/target/dependency-check-report.html`
- **Résultat** : Liste des CVE par dépendance + sévérité
- **Action** : Si vulnérabilité trouvée → mettre à jour dépendance

---

### Q18. Qu'est-ce que fait CodeQL au niveau du code ?

**Réponse courte :**
- **Analyse statique** : Cherche vulnérabilités (injection SQL, XSS, etc.)
- **Langages** : Java + JavaScript dans notre projet
- **Résultat** : Uploads automatiquement vers GitHub Security tab
- **Ciblage** : Queries `security-extended` + `security-and-quality`

---

### Q19. Qu'est-ce que Semgrep apporte de plus que CodeQL ?

**Réponse courte :**
- **CodeQL** : Deep AST analysis (très précis, peut avoir faux-négatifs)
- **Semgrep** : Pattern matching rapide + OWASP rules spécifiques
- **Combinaison** : Double vérification = meilleure détection
- **Dans notre projet** : Semgrep scanne aussi Dockerfiles !

---

### Q20. Comment on corrige une vulnérabilité détectée ?

**Réponse courte :**
1. **Identifiée par OWASP Dependency-Check** : `[CVE-2024-xxxxx]`
2. **Vérifier** : `mvn dependency:tree | grep vulnerable-lib`
3. **Mettre à jour** : pom.xml (version sûre)
4. **Recompiler** : `mvn clean package`
5. **Retester** : Re-run OWASP Dependency-Check
6. **Commit** : Pusher les changements
7. **Vérifier** : Workflow GitHub Actions doit passer ✓

---

### Q21. Est-ce qu'on a des secrets exposés dans le repo ?

**Réponse courte :**
- **Vérification** : Semgrep scanne les patterns de secrets
- **Dangers** : Credentials en dur dans le code
- **Notre approche** : 
  - Secrets en variables d'environnement (docker-compose.yml, GitHub Secrets)
  - Pas de hardcoding ✓
- **Meilleure pratique** : Vault ou AWS Secrets Manager en production

---

### Q22. Qu'est-ce qu'il faut faire avant de merger une PR ?

**Réponse courte :**
1. ✓ CodeQL Analysis réussit
2. ✓ Semgrep SAST réussit
3. ✓ OWASP Dependency-Check = 0 vulnérabilités critiques
4. ✓ Build réussit (`mvn clean package`)
5. ✓ Tests passent
6. ✓ Code review approuvée
7. → Merge OK !

---

### Q23. Comment on configure les GitHub Secrets pour la sécurité ?

**Réponse courte :**
- **GitHub** → Settings → Secrets and variables → Actions
- **Variables à ajouter** :
  - `NVD_API_KEY` = pour OWASP Dependency-Check
  - `SONAR_TOKEN` = pour SonarQube (si implémenté)
  - `DOCKER_USERNAME`, `DOCKER_PASSWORD` = pour push images
- **Utilisé dans workflow** : `${{ secrets.NVD_API_KEY }}`

---

## 📋 RÉSUMÉ ARCHITECTURE SÉCURITÉ

```
┌─────────────┐
│ React App   │ ← OIDC Login
└──────┬──────┘
       │ (JWT dans headers)
       ↓
┌──────────────────┐
│  API GATEWAY     │ ← Valide JWT
│  (Port 8085)     │ ← ZERO TRUST
└──────┬───────────┘
       │ (JWT propagé)
       ├─→ Product-Service ← Valide JWT
       └─→ Order-Service   ← Valide JWT

Keycloak (Port 8080) = Source d'autorité pour rôles + tokens
```

---

## ✅ CHECKLIST SÉCURITÉ

- [x] Authentification OAuth2/OIDC via Keycloak
- [x] JWT validation au niveau Gateway
- [x] JWT validation au niveau Services (défense en profondeur)
- [x] Rôles centralisés (ADMIN, CLIENT)
- [x] Non-root users dans Dockerfiles
- [x] Alpine images (minimales)
- [x] CodeQL Analysis automatique
- [x] Semgrep SAST automatique
- [x] OWASP Dependency-Check automatique
- [x] CORS restrictif (React vers Gateway)
- [x] Aucune logique métier dans Gateway
- [ ] SonarQube (optionnel)
- [ ] Trivy pour scan Docker (à implémenter)

---

**Dernière mise à jour** : Jan 2026 | Projet E-Commerce Microservices
