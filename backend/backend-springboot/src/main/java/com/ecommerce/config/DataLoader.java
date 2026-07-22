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

        createProductIfMissing("SKU-1001", "Wireless Earbuds", "Premium noise-cancelling earbuds with up to 24 hours battery.", 49.99, 120, "electronics", "https://images.unsplash.com/photo-1518449038577-1f34f0a7f0a2?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1002", "Smart Watch", "Water-resistant smartwatch with fitness tracking and notifications.", 129.99, 80, "electronics", "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1003", "Classic Sneakers", "Comfortable everyday sneakers with durable rubber sole.", 69.99, 200, "fashion", "https://images.unsplash.com/photo-1528701800489-20a5b7e9d071?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1004", "Leather Backpack", "Stylish leather backpack with laptop compartment and adjustable straps.", 89.99, 50, "fashion", "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1005", "Ceramic Coffee Mug", "Premium ceramic mug with ergonomic handle and 350ml capacity.", 14.99, 250, "home", "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1006", "Bluetooth Speaker", "Portable speaker with deep bass and 12-hour playtime.", 59.99, 95, "electronics", "https://images.unsplash.com/photo-1512499617640-c2f99912cb7b?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1007", "Running Shoes", "Lightweight running shoes with breathable upper mesh.", 74.99, 165, "fashion", "https://images.unsplash.com/photo-1528701800489-20a5b7e9d071?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1008", "Denim Jacket", "Classic denim jacket with button front and two chest pockets.", 79.99, 60, "fashion", "https://images.unsplash.com/photo-1520962910209-9703b4a4a19c?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1009", "Fitness Tracker", "Activity tracker with heart rate and sleep monitoring.", 39.99, 110, "electronics", "https://images.unsplash.com/photo-1526401485004-2ce6ba0b45b0?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1010", "Coffee Maker", "Programmable coffee maker with 12-cup glass carafe.", 89.99, 70, "home", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1011", "Yoga Mat", "Non-slip yoga mat with cushioning for comfortable workouts.", 24.99, 140, "fitness", "https://images.unsplash.com/photo-1571019613914-85f342c8f52a?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1012", "Designer Sunglasses", "Polarized sunglasses with UV protection and lightweight frame.", 49.99, 95, "fashion", "https://images.unsplash.com/photo-1520975910844-54b8354556a9?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1013", "Leather Wallet", "Slim leather wallet with RFID-blocking protection.", 34.99, 180, "fashion", "https://images.unsplash.com/photo-1511816129144-cf3e999751a5?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1014", "Laptop Stand", "Ergonomic aluminum laptop stand with adjustable height.", 39.99, 75, "electronics", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1015", "Noise-Cancelling Headphones", "Over-ear headphones with active noise cancellation.", 99.99, 100, "electronics", "https://images.unsplash.com/photo-1517502166878-35c93a0072bb?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1016", "Smart Lamp", "Color-changing smart lamp with remote control.", 29.99, 130, "home", "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1017", "Wireless Charger", "Fast wireless charging pad compatible with Qi devices.", 22.99, 145, "electronics", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1018", "Backpack Cooler", "Insulated cooler backpack for drinks and snacks on the go.", 54.99, 55, "outdoors", "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1019", "Travel Mug", "Stainless steel travel mug with leak-proof lid.", 18.99, 210, "home", "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=400&q=80");
        createProductIfMissing("SKU-1020", "Board Game", "Strategy board game for family and friends.", 34.99, 125, "toys", "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=400&q=80");

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
