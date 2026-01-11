package ma.enset.orderservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    private String client;

    @NotNull
    private LocalDate date;

    @PositiveOrZero
    private double total;

    @NotBlank
    private String status;

    public Order() {
    }

    public Order(String client, LocalDate date, double total, String status) {
        this.client = client;
        this.date = date;
        this.total = total;
        this.status = status;
    }

    // getters / setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getClient() { return client; }
    public void setClient(String client) { this.client = client; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}