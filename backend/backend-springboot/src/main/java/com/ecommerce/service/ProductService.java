package com.ecommerce.service;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductsResponseDTO;
import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public ProductsResponseDTO getProducts(String search, String category, String sort, int page, int limit) {
        List<ProductDTO> allProducts = productRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Filter by search and category if provided
        List<ProductDTO> filtered = allProducts.stream()
                .filter(product -> search == null || search.isBlank() ||
                        product.getName().toLowerCase().contains(search.toLowerCase()) ||
                        product.getDescription().toLowerCase().contains(search.toLowerCase()))
                .filter(product -> category == null || category.isBlank() ||
                        category.equalsIgnoreCase(product.getCategory()))
                .sorted((a, b) -> {
                    return switch (sort) {
                        case "price-asc" -> a.getPrice().compareTo(b.getPrice());
                        case "price-desc" -> b.getPrice().compareTo(a.getPrice());
                        case "name" -> a.getName().compareToIgnoreCase(b.getName());
                        default -> 0;
                    };
                })
                .collect(Collectors.toList());

        int total = filtered.size();
        int totalPages = (int) Math.ceil((double) total / limit);
        int fromIndex = Math.min((page - 1) * limit, total);
        int toIndex = Math.min(fromIndex + limit, total);
        List<ProductDTO> pagedProducts = filtered.subList(fromIndex, toIndex);

        return ProductsResponseDTO.builder()
                .products(pagedProducts)
                .total(total)
                .page(page)
                .totalPages(totalPages)
                .build();
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Product not found with id: " + id));
        return convertToDTO(product);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getAllCategories() {
        return List.of(
                new CategoryDTO(1L, "Electronics", "electronics", "💻"),
                new CategoryDTO(2L, "Clothing", "clothing", "👕"),
                new CategoryDTO(3L, "Home & Garden", "home-garden", "🏡"),
                new CategoryDTO(4L, "Sports", "sports", "⚽"),
                new CategoryDTO(5L, "Books", "books", "📚"),
                new CategoryDTO(6L, "Beauty", "beauty", "💄")
        );
    }
    
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = convertToEntity(productDTO);
        if (product.getStock() == null) {
            product.setStock(0);
        }
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product = productRepository.save(product);
        return convertToDTO(product);
    }
    
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Product not found with id: " + id));
        
        if (productDTO.getName() != null) {
            product.setName(productDTO.getName());
        }
        if (productDTO.getDescription() != null) {
            product.setDescription(productDTO.getDescription());
        }
        if (productDTO.getPrice() != null) {
            product.setPrice(productDTO.getPrice());
        }
        if (productDTO.getStock() != null) {
            product.setStock(productDTO.getStock());
        } else if (productDTO.getInStock() != null) {
            product.setStock(productDTO.getInStock() ? 1 : 0);
        }
        if (productDTO.getCategory() != null) {
            product.setCategory(productDTO.getCategory());
        }
        if (productDTO.getImageUrl() != null) {
            product.setImageUrl(productDTO.getImageUrl());
        }
        if (productDTO.getActive() != null) {
            product.setActive(productDTO.getActive());
        }
        product.setUpdatedAt(LocalDateTime.now());
        
        product = productRepository.save(product);
        return convertToDTO(product);
    }
    
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Product not found with id: " + id));
        product.setActive(false);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }
    
    public Product getProductEntityById(Long id) {
        return productRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Product not found with id: " + id));
    }
    
    public ProductDTO convertToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
    
    private Product convertToEntity(ProductDTO productDTO) {
        return Product.builder()
                .sku(productDTO.getSku())
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .price(productDTO.getPrice())
                .stock(productDTO.getStock())
                .category(productDTO.getCategory())
                .imageUrl(productDTO.getImageUrl())
                .active(productDTO.getActive() != null ? productDTO.getActive() : true)
                .build();
    }
}
