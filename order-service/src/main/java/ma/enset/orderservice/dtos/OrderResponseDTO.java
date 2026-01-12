package ma.enset.orderservice.dtos;

import lombok.Builder;
import ma.enset.orderservice.OrderStatus;

import java.time.LocalDateTime;

@Builder
public record OrderResponseDTO(
        String id,
        String clientId,
        String productId,
        int quantity,
        OrderStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}
