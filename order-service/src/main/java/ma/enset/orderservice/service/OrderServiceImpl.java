package ma.enset.orderservice.service;

import lombok.AllArgsConstructor;
import ma.enset.orderservice.OrderStatus;
import ma.enset.orderservice.dtos.CreateOrderRequestDTO;
import ma.enset.orderservice.dtos.OrderResponseDTO;
import ma.enset.orderservice.dtos.UpdateOrderRequestDTO;
import ma.enset.orderservice.mappers.OrderMapper;
import ma.enset.orderservice.model.Order;
import ma.enset.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository repository;
    private final OrderMapper mapper;

    @Override
    public List<OrderResponseDTO> findAll() {
        return repository.findAll().stream().map(mapper::toResponseDTO).toList();
    }

    @Override
    public List<OrderResponseDTO> findByClientId(String clientId) {
        return repository.findByClientId(clientId).stream().map(mapper::toResponseDTO).toList();
    }

    @Override
    public OrderResponseDTO findById(String id) {
        Order order = repository.findById(id).orElse(null);

        if (order == null) {
            return null;
        }

        return mapper.toResponseDTO(order);
    }

    @Override
    public OrderResponseDTO save(CreateOrderRequestDTO request) {

        Order order = mapper.toEntity(request);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        order = repository.save(order);

        return mapper.toResponseDTO(order);
    }

    @Override
    public OrderResponseDTO update(String id, UpdateOrderRequestDTO request) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        order.setQuantity(request.quantity());
        order.setStatus(request.status());
        order.setUpdatedAt(LocalDateTime.now());

        order = repository.save(order);

        return mapper.toResponseDTO(order);
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }
}
