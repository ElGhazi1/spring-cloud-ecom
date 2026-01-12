package ma.enset.orderservice.controller;

import lombok.AllArgsConstructor;
import ma.enset.orderservice.dtos.CreateOrderRequestDTO;
import ma.enset.orderservice.dtos.OrderResponseDTO;
import ma.enset.orderservice.dtos.UpdateOrderRequestDTO;
import ma.enset.orderservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT')")
    public List<OrderResponseDTO> list(Authentication authentication) {
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            // Admin can see all orders
            return orderService.findAll();
        } else {
            // Client can only see their own orders
            String clientId = getUserIdFromToken(authentication);
            return orderService.findByClientId(clientId);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT')")
    public OrderResponseDTO get(@PathVariable String id, Authentication authentication) {
        OrderResponseDTO order = orderService.findById(id);

        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        // If user is not admin, check if the order belongs to them
        if (authentication.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            String clientId = getUserIdFromToken(authentication);
            if (!order.clientId().equals(clientId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own orders");
            }
        }

        return order;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT')")
    public OrderResponseDTO create(@RequestBody CreateOrderRequestDTO request, Authentication authentication) {
        // If user is not admin, ensure they can only create orders for themselves
        if (authentication.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            String clientId = getUserIdFromToken(authentication);
            // Validate that the request clientId matches the authenticated user
            if (request.clientId() != null && !request.clientId().equals(clientId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only create orders for yourself");
            }
        }
        return orderService.save(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponseDTO update(@PathVariable String id, @RequestBody UpdateOrderRequestDTO order) {
        return orderService.update(id, order);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        orderService.delete(id);
    }

    private String getUserIdFromToken(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getSubject();
    }
}
