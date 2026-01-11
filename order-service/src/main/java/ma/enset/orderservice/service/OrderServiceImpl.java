package ma.enset.orderservice.service;

import ma.enset.orderservice.model.Order;
import ma.enset.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository repository;

    public OrderServiceImpl(OrderRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Order> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Order> findById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public Order save(Order order) {
        return repository.save(order);
    }

    @Override
    public Order update(Integer id, Order order) {
        return repository.findById(id).map(o -> {
            o.setClient(order.getClient());
            o.setDate(order.getDate());
            o.setTotal(order.getTotal());
            o.setStatus(order.getStatus());
            return repository.save(o);
        }).orElseGet(() -> {
            order.setId(id);
            return repository.save(order);
        });
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
