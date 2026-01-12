package ma.enset.orderservice.dtos;

import lombok.Builder;

@Builder
public record CreateOrderRequestDTO(
        String productId,
        int quantity
) {
}
