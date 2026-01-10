


┌──(elghazi㉿kali)-[~/IdeaProjects/ecom]
└─$ curl -X POST 'http://127.0.0.1:8080/realms/ecom/protocol/openid-connect/token' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=ecom-backend' \
  -d 'client_secret=ecom-secret'
{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKcTJOS1lERllZSENnRVI5Sk5xTlYyblktWU1NVlc1b2J3RnRZU0lXVlN3In0.eyJleHAiOjE3NjgwNDk2ODYsImlhdCI6MTc2ODA0OTM4NiwianRpIjoidHJydGNjOmIyZGMzYWIzLTBkM2EtYzNlNy03NWZmLWVjMTQ3ZDViODQ0OSIsImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6ODA4MC9yZWFsbXMvZWNvbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwN2Y1ODE0OS1lYWZlLTQ3M2ItYjIzNi0wZTRmM2E1ZWE3Y2QiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJlY29tLWJhY2tlbmQiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLWVjb20iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJjbGllbnRIb3N0IjoiMTcyLjE3LjAuMSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoic2VydmljZS1hY2NvdW50LWVjb20tYmFja2VuZCIsImNsaWVudEFkZHJlc3MiOiIxNzIuMTcuMC4xIiwiY2xpZW50X2lkIjoiZWNvbS1iYWNrZW5kIn0.jaI5ZkJPhfEfb0saqDGshYvx2OKSo86y3jRLBVjtlBlUgQpSaNi1A0-CzSdvXsTQ-QMJY0hkEHC2Oism6anM79IZ26GPIQqIuTze6obvWroP24TWaMBbgDpD2eKmvEsIoHlXRci7WTyyi3wf7SEBVSxD4c4xlKKxtkvkpe40sJMOhDgmVfLY8IHxi1WUT69oRsN400y4rhFtxWF4FL428IymGdlINE9hcgiRH_McEKI3xseg8YbH6PyLW1HbEPxegKCv4r99TAilS6YQkcfSh5IV7rk0fv-bj5yxp_iu7eETF4rHGBefvW8QC_l1DHdIBIm4eRs7EIkNXioTaGcoUw","expires_in":300,"refresh_expires_in":0,"token_type":"Bearer","not-before-policy":0,"scope":"email profile"}
┌──(elghazi㉿kali)-[~/IdeaProjects/ecom]
└─$ 

┌──(elghazi㉿kali)-[~/IdeaProjects/ecom]
└─$ ls
gateway-service  oidc-redirect.html  pom.xml          smoke.sh  target
keycloak         order-service       product-service  src       TESTING.md

┌──(elghazi㉿kali)-[~/IdeaProjects/ecom]
└─$ chmod +x smoke.sh 

┌──(elghazi㉿kali)-[~/IdeaProjects/ecom]
└─$ ./smoke.sh 
Using Keycloak: http://127.0.0.1:8080 (realm: ecom)
Obtaining client_credentials token for 'ecom-backend'...
Token obtained (truncated): eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwi...
Checking Gateway - products (no auth) -> http://127.0.0.1:8888/products ... 401
Checking Gateway - products (with token) -> http://127.0.0.1:8888/products ... 401
Checking Product - health -> http://127.0.0.1:8081/actuator/health ... 200
Checking Product - openapi -> http://127.0.0.1:8081/v3/api-docs ... 401
Checking Order - health -> http://127.0.0.1:8082/actuator/health ... 200
Checking Order - openapi -> http://127.0.0.1:8082/v3/api-docs ... 401
Checking Gateway-swagger proxy (product) ... 401

Smoke tests finished. If codes are 200 (or 401 for protected endpoints), services are responding.



# Tests & Development endpoints (Actuator + Swagger)

Ce dépôt expose désormais des endpoints Actuator et OpenAPI (Swagger) pour faciliter les tests et le débogage. La configuration est consolidée dans `application.properties` pour chaque service.

## Accès (local)
- Gateway Actuator: http://localhost:8888/actuator/health
- Product Swagger (service): http://product-service:8081/swagger-ui.html
- Product Swagger (via gateway proxy): http://localhost:8888/services/product/swagger-ui.html
- Order Swagger (service): http://order-service:8082/swagger-ui.html
- Order Swagger (via gateway proxy): http://localhost:8888/services/order/swagger-ui.html

## Lancer les tests d'intégration
Chaque service inclut un test d'intégration très basique qui vérifie que `/actuator/health` et `/v3/api-docs` répondent :

- Product service:
  mvn -pl product-service test

- Order service:
  mvn -pl order-service test

Pour des tests E2E via Gateway, réutilisez le script Python présent à la racine `e2e_tests.py` :

python e2e_tests.py --gateway http://localhost:8888 --kc <KEYCLOAK_URL> --realm ecom
Optional: Browser-based smoke test with Playwright (requires Playwright to be installed):

pip install playwright
playwright install
python e2e/playwright_smoke.py --gateway http://localhost:8888

This script simply navigates to the Product Swagger UI via the gateway and asserts it loads.
> Remarque: pour des raisons de commodité en développement, les endpoints Actuator et OpenAPI sont accessibles sans authentification par défaut (configuration dans `application.properties`). Ne pas reproduire ceci en production.
