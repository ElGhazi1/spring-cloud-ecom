package ma.enset.orderservice.dtos;

import lombok.Builder;

@Builder
public record CreateOrderRequestDTO(
        String clientId,
        String productId,
        int quantity
) {
}
