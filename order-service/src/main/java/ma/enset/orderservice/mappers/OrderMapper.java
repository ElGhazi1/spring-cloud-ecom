package ma.enset.orderservice.mappers;

import ma.enset.orderservice.dtos.CreateOrderRequestDTO;
import ma.enset.orderservice.dtos.OrderResponseDTO;
import ma.enset.orderservice.dtos.UpdateOrderRequestDTO;
import ma.enset.orderservice.model.Order;

public interface OrderMapper {

    CreateOrderRequestDTO toCreateOrderRequestDTO(Order order);

    OrderResponseDTO toResponseDTO(Order order);

    Order toEntity(CreateOrderRequestDTO requestDTO);

    Order toEntity(UpdateOrderRequestDTO requestDTO);
}
