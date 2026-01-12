package ma.enset.orderservice.mappers;

import ma.enset.orderservice.dtos.CreateOrderRequestDTO;
import ma.enset.orderservice.dtos.OrderResponseDTO;
import ma.enset.orderservice.dtos.UpdateOrderRequestDTO;
import ma.enset.orderservice.model.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapperImpl implements OrderMapper {
    @Override
    public CreateOrderRequestDTO toCreateOrderRequestDTO(Order order) {
        return CreateOrderRequestDTO.builder()
                .clientId(order.getClientId())
                .productId(order.getProductId())
                .quantity(order.getQuantity())
                .build();
    }

    @Override
    public OrderResponseDTO toResponseDTO(Order order) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .clientId(order.getClientId())
                .productId(order.getProductId())
                .quantity(order.getQuantity())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    @Override
    public Order toEntity(CreateOrderRequestDTO requestDTO) {
        return Order.builder()
                .clientId(requestDTO.clientId())
                .productId(requestDTO.productId())
                .quantity(requestDTO.quantity())
                .build();
    }

    @Override
    public Order toEntity(UpdateOrderRequestDTO requestDTO) {
        return Order.builder()
                .quantity(requestDTO.quantity())
                .status(requestDTO.status())
                .build();
    }
}
