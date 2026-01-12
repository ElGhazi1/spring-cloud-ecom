package ma.enset.orderservice.dtos;

import lombok.Builder;
import ma.enset.orderservice.OrderStatus;

@Builder
public record UpdateOrderRequestDTO(
        int quantity,
        OrderStatus status
) {
}
