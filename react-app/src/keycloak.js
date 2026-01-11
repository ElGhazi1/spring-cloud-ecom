import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: process.env.KEYCLOAK_URL || "http://localhost:8080",
    realm: "ecom",
    clientId: "ecom-frontend",
});

export default keycloak;
