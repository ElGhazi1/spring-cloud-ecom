package ma.enset.orderservice.controller;

import ma.enset.orderservice.dtos.CreateOrderRequestDTO;
import ma.enset.orderservice.dtos.OrderResponseDTO;
import ma.enset.orderservice.dtos.UpdateOrderRequestDTO;
import ma.enset.orderservice.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT')")
    public List<OrderResponseDTO> list() {
        return orderService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT')")
    public OrderResponseDTO get(@PathVariable String id) {
        return orderService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponseDTO create(@RequestBody CreateOrderRequestDTO request) {
        return orderService.save(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponseDTO update(@PathVariable String id, @RequestBody UpdateOrderRequestDTO order) {
        return orderService.update(id, order);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable String id) {
        orderService.delete(id);
        return id;
    }
}
