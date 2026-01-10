import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://127.0.0.1:8080",
    realm: "ecom",
    clientId: "ecom-frontend",
});

export default keycloak;
