package com.ecommerce.config;

import com.ecommerce.dto.AddressDTO;
import com.ecommerce.model.Cart;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.CartService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class DataLoader implements CommandLineRunner {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CartService cartService;

    @Override
    public void run(String... args) {
        createUserIfMissing("admin@vueshop.com", "admin123", "Admin", "User", User.UserRole.ADMIN);
        createUserIfMissing("john@example.com", "password123", "John", "Doe", User.UserRole.CUSTOMER);
        createUserIfMissing("jane@example.com", "password123", "Jane", "Doe", User.UserRole.CUSTOMER);

        createProductIfMissing("SKU-1001", "Wireless Earbuds", "Premium noise-cancelling earbuds with up to 24 hours battery.", 49.99, 120, "electronics", "https://placehold.co/300x300?text=Earbuds");
        createProductIfMissing("SKU-1002", "Smart Watch", "Water-resistant smartwatch with fitness tracking and notifications.", 129.99, 80, "electronics", "https://placehold.co/300x300?text=Smart+Watch");
        createProductIfMissing("SKU-1003", "Classic Sneakers", "Comfortable everyday sneakers with durable rubber sole.", 69.99, 200, "fashion", "https://placehold.co/300x300?text=Sneakers");
        createProductIfMissing("SKU-1004", "Leather Backpack", "Stylish leather backpack with laptop compartment and adjustable straps.", 89.99, 50, "fashion", "https://placehold.co/300x300?text=Backpack");
        createProductIfMissing("SKU-1005", "Ceramic Coffee Mug", "Premium ceramic mug with ergonomic handle and 350ml capacity.", 14.99, 250, "home", "https://placehold.co/300x300?text=Coffee+Mug");

        createSampleOrderIfMissing("john@example.com", Map.of("SKU-1001", 2, "SKU-1005", 1), new AddressDTO("John Doe", "123 Demo Street", "Demo City", "Demo State", "12345", "USA", "555-0101"), "Leave at the front door.");
        createSampleOrderIfMissing("jane@example.com", Map.of("SKU-1003", 1, "SKU-1004", 1), new AddressDTO("Jane Doe", "456 Market Road", "Demo City", "Demo State", "67890", "USA", "555-0202"), "Please deliver between 4pm and 6pm.");
    }

    private void createUserIfMissing(String email, String rawPassword, String firstName, String lastName, User.UserRole role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user = userRepository.save(user);

        Cart cart = new Cart();
        cart.setUser(user);
        cartService.saveCart(cart);
    }

    private void createProductIfMissing(String sku, String name, String description, double price, int stock, String category, String imageUrl) {
        var existingProduct = productRepository.findBySku(sku);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            String fixedUrl = fixPlaceholderUrl(product.getImageUrl());
            if (fixedUrl != null && !fixedUrl.equals(product.getImageUrl())) {
                product.setImageUrl(fixedUrl);
                productRepository.save(product);
            }
            return;
        }

        Product product = Product.builder()
                .sku(sku)
                .name(name)
                .description(description)
                .price(BigDecimal.valueOf(price))
                .stock(stock)
                .category(category)
                .imageUrl(fixPlaceholderUrl(imageUrl))
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        productRepository.save(product);
    }

    private String fixPlaceholderUrl(String imageUrl) {
        if (imageUrl == null) {
            return null;
        }
        if (imageUrl.contains("via.placeholder.com")) {
            return imageUrl.replace("https://via.placeholder.com/", "https://placehold.co/");
        }
        return imageUrl;
    }

    private void createSampleOrderIfMissing(String email, Map<String, Integer> items, AddressDTO shippingAddress, String notes) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        if (!orderRepository.findByUserId(user.getId()).isEmpty()) {
            return;
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PROCESSING);
        order.setNotes(notes);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setPaymentMethod("credit_card");
        order.setTrackingNumber("TRK-" + user.getId() + "-" + System.currentTimeMillis());
        try {
            order.setShippingAddress(OBJECT_MAPPER.writeValueAsString(shippingAddress));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize shipping address", e);
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (Map.Entry<String, Integer> entry : items.entrySet()) {
            Product product = productRepository.findBySku(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + entry.getKey()));
            int quantity = entry.getValue();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(product.getPrice());
            order.getItems().add(orderItem);

            totalPrice = totalPrice.add(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        }

        order.setTotalPrice(totalPrice);
        orderRepository.save(order);
    }
}
