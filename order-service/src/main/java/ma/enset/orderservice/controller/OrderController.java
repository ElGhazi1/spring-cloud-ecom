package ma.enset.orderservice.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @GetMapping
    @PreAuthorize("hasRole('CLIENT')")
    public String getOrders(Authentication authentication) {
        return "Commandes de l'utilisateur : " + authentication.getName();
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public String createOrder(Authentication authentication) {
        return "Commande créée par : " + authentication.getName();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminOrders() {
        return "Gestion des commandes (ADMIN)";
    }
}
