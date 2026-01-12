import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import keycloak from "./keycloak";
import { AlertProvider } from "./contexts/AlertContext";

keycloak.init({
    onLoad: "login-required",
    pkceMethod: "S256",
    checkLoginIframe: false,
}).then((authenticated) => {

    if (!authenticated) {
        window.location.reload();
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
        <AlertProvider>
            <App keycloak={keycloak} />
        </AlertProvider>
    );
});
