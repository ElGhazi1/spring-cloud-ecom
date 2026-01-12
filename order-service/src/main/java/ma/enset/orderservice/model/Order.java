package ma.enset.orderservice.model;

import jakarta.persistence.*;
import lombok.*;
import ma.enset.orderservice.OrderStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String clientId;
    private String productId;
    private int quantity;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}