package ma.enset.orderservice.service;

import ma.enset.orderservice.model.Order;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    List<Order> findAll();
    Optional<Order> findById(Integer id);
    Order save(Order order);
    Order update(Integer id, Order order);
    void delete(Integer id);
}
