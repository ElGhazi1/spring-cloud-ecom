package ma.enset.productservice.service;

import ma.enset.productservice.model.Product;
import ma.enset.productservice.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repository;

    public ProductServiceImpl(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Product> findAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Product> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Product save(Product product) {
        return repository.save(product);
    }

    @Override
    public Product update(Long id, Product product) {
        return repository.findById(id).map(p -> {
            p.setName(product.getName());
            p.setDescription(product.getDescription());
            p.setPrice(product.getPrice());
            p.setQuantity(product.getQuantity());
            return repository.save(p);
        }).orElseGet(() -> {
            product.setId(id);
            return repository.save(product);
        });
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
