package ma.enset.productservice.service;

import ma.enset.productservice.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    List<Product> findAll();
    Optional<Product> findById(Long id);
    Product save(Product product);
    Product update(Long id, Product product);
    void delete(Long id);
}
