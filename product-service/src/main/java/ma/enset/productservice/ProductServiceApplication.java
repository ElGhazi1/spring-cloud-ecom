package ma.enset.productservice;

import ma.enset.productservice.model.Product;
import ma.enset.productservice.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;

@SpringBootApplication
public class ProductServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(ProductRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Product("Clavier", "Clavier mécanique", new BigDecimal("49.99"), 100));
                repository.save(new Product("Souris", "Souris sans fil", new BigDecimal("19.99"), 200));
                repository.save(new Product("Écran", "Écran 24\" Full HD", new BigDecimal("129.99"), 25));
            }
        };
    }

}
