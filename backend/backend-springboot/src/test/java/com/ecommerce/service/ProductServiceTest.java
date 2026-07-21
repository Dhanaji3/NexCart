package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void updateProductShouldMapInStockFlagToStockWhenStockIsNotProvided() {
        Product existing = Product.builder()
                .id(24L)
                .sku("DEE-20")
                .name("Old product")
                .description("Old description")
                .price(new BigDecimal("10.00"))
                .stock(0)
                .category("clothing")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(productRepository.findById(24L)).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductDTO request = new ProductDTO();
        request.setName("T shirt");
        request.setDescription("Men T-shirt");
        request.setPrice(new BigDecimal("12.00"));
        request.setCategory("clothing");
        request.setImage("");
        request.setStock(5);

        ProductDTO result = productService.updateProduct(24L, request);

        assertEquals(5, result.getStock());
        assertTrue(result.getInStock());
        verify(productRepository).save(any(Product.class));
    }
}
