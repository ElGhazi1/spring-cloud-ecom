package ma.enset.orderservice.service;

import ma.enset.orderservice.dtos.CreateOrderRequestDTO;
import ma.enset.orderservice.dtos.OrderResponseDTO;
import ma.enset.orderservice.dtos.UpdateOrderRequestDTO;
import ma.enset.orderservice.model.Order;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    List<OrderResponseDTO> findAll();
    OrderResponseDTO findById(String id);
    OrderResponseDTO save(CreateOrderRequestDTO request);
    OrderResponseDTO update(String id, UpdateOrderRequestDTO request);
    void delete(String id);
}
