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

       createProductIfMissing(
    "SKU-1001",
    "Apple iPhone 16 (128GB)",
    "Latest Apple iPhone with A18 chip, Super Retina XDR display and advanced dual-camera system.",
    79999,
    45,
    "electronics",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1002",
    "Samsung Galaxy S25",
    "Premium Samsung flagship smartphone with AMOLED display and AI camera.",
    74999,
    38,
    "electronics",
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1003",
    "Sony WH-1000XM5 Headphones",
    "Industry-leading noise cancelling wireless headphones with 30-hour battery life.",
    29990,
    52,
    "electronics",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1004",
    "Apple Watch Series 10",
    "Advanced smartwatch with fitness tracking, ECG, GPS and Always-On Retina display.",
    46999,
    30,
    "electronics",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1005",
    "OnePlus Buds Pro 3",
    "Premium true wireless earbuds with adaptive noise cancellation.",
    11999,
    90,
    "electronics",
    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1006",
    "Dell Inspiron 15 Laptop",
    "15.6-inch Full HD laptop with Intel Core i5, 16GB RAM and 512GB SSD.",
    62999,
    24,
    "electronics",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1007",
    "JBL Flip 6 Bluetooth Speaker",
    "Portable waterproof Bluetooth speaker with powerful bass and 12-hour playtime.",
    10999,
    75,
    "electronics",
    "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1008",
    "Canon EOS R50 Mirrorless Camera",
    "24.2MP mirrorless camera with 4K video recording and RF-S 18-45mm lens.",
    68999,
    18,
    "electronics",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1009",
    "Logitech MX Master 3S Mouse",
    "Wireless ergonomic productivity mouse with ultra-fast scrolling.",
    9499,
    120,
    "electronics",
    "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1010",
    "Samsung 27-inch 4K Smart Monitor",
    "Ultra HD IPS monitor with Smart TV apps, HDR10 support and USB-C connectivity.",
    28999,
    27,
    "electronics",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80"
);
createProductIfMissing(
    "SKU-1011",
    "Nike Air Max Running Shoes",
    "Lightweight running shoes with Air Max cushioning for superior comfort.",
    8999,
    65,
    "clothing",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1012",
    "Adidas Essentials Hoodie",
    "Soft fleece hoodie with adjustable drawstring hood and kangaroo pocket.",
    3499,
    90,
    "clothing",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1013",
    "Levi's 511 Slim Fit Jeans",
    "Premium stretch denim jeans with modern slim fit.",
    4299,
    70,
    "clothing",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1014",
    "Puma Sports T-Shirt",
    "Breathable quick-dry sports t-shirt for workouts and running.",
    1499,
    120,
    "clothing",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1015",
    "Allen Solly Formal Shirt",
    "Premium cotton slim fit formal shirt suitable for office wear.",
    2299,
    80,
    "clothing",
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1016",
    "Woodland Leather Jacket",
    "Genuine leather biker jacket with premium stitching.",
    9999,
    28,
    "clothing",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1017",
    "Van Heusen Blazer",
    "Classic navy blue blazer for formal occasions.",
    6999,
    35,
    "clothing",
    "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1018",
    "Nike Dri-FIT Shorts",
    "Comfortable training shorts with sweat-wicking fabric.",
    1999,
    110,
    "clothing",
    "https://images.unsplash.com/photo-1506629905607-d405b7a3b6c8?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1019",
    "US Polo Cotton Polo T-Shirt",
    "Premium pique cotton polo t-shirt with embroidered logo.",
    2499,
    95,
    "clothing",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1020",
    "Ray-Ban Aviator Sunglasses",
    "Classic polarized aviator sunglasses with UV400 protection.",
    7999,
    42,
    "clothing",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
);
createProductIfMissing(
    "SKU-1021",
    "Prestige Induction Cooktop",
    "Energy-efficient induction cooktop with preset Indian cooking menus.",
    3499,
    65,
    "home-garden",
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1022",
    "Milton Stainless Steel Water Bottle",
    "1 Litre vacuum insulated stainless steel water bottle that keeps drinks hot or cold for hours.",
    999,
    140,
    "home-garden",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1023",
    "Philips Air Fryer",
    "Healthy air fryer with Rapid Air Technology for oil-free cooking.",
    8999,
    40,
    "home-garden",
    "https://images.unsplash.com/photo-1585515656973-7e3e8b1dd7b4?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1024",
    "Hawkins Pressure Cooker 5L",
    "Durable aluminium pressure cooker suitable for Indian kitchens.",
    2599,
    95,
    "home-garden",
    "https://images.unsplash.com/photo-1584990347449-a16d5d6f4b34?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1025",
    "Modern Table Lamp",
    "Minimalist LED table lamp with adjustable brightness and USB charging.",
    1899,
    80,
    "home-garden",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1026",
    "Indoor Snake Plant",
    "Low-maintenance indoor plant that improves air quality and home décor.",
    699,
    130,
    "home-garden",
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1027",
    "Wooden Bookshelf",
    "Modern engineered wood bookshelf with five spacious storage shelves.",
    7499,
    22,
    "home-garden",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1028",
    "Garden Watering Can",
    "Premium 5-litre watering can for indoor and outdoor gardening.",
    799,
    90,
    "home-garden",
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1029",
    "Non-Stick Cookware Set",
    "10-piece non-stick cookware set with induction-compatible base.",
    4999,
    55,
    "home-garden",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1030",
    "Memory Foam Pillow",
    "Orthopedic memory foam pillow designed for neck and back support.",
    1499,
    110,
    "home-garden",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80"
);
createProductIfMissing(
    "SKU-1031",
    "Nivia Storm Football",
    "Official size 5 football with durable TPU outer cover for training and matches.",
    1199,
    150,
    "sports",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1032",
    "Yonex GR 303 Badminton Racket",
    "Lightweight badminton racket suitable for beginners and intermediate players.",
    1499,
    90,
    "sports",
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1033",
    "Cosco Cricket Bat",
    "Premium English willow style cricket bat for tennis and leather ball practice.",
    2499,
    70,
    "sports",
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1034",
    "Vector X Basketball",
    "Official size basketball with superior grip for indoor and outdoor courts.",
    1599,
    95,
    "sports",
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1035",
    "Boldfit Yoga Mat",
    "6mm anti-slip yoga mat with carrying strap for yoga and fitness workouts.",
    999,
    180,
    "sports",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1036",
    "USI Adjustable Dumbbells (10kg)",
    "Adjustable dumbbell set perfect for home gym strength training.",
    3999,
    55,
    "sports",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1037",
    "Decathlon Skipping Rope",
    "High-speed adjustable skipping rope for cardio and endurance workouts.",
    499,
    220,
    "sports",
    "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1038",
    "Adidas Gym Bag",
    "Spacious sports duffle bag with shoe compartment and adjustable shoulder strap.",
    2299,
    85,
    "sports",
    "https://images.unsplash.com/photo-1542291026-c5d6d7f89c4f?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1039",
    "Camping Tent (4 Person)",
    "Waterproof outdoor camping tent suitable for trekking and family camping trips.",
    6999,
    35,
    "sports",
    "https://images.unsplash.com/photo-1504280390368-397dc0e38c36?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1040",
    "Fitness Resistance Bands Set",
    "Set of five resistance bands for strength training, stretching and rehabilitation.",
    899,
    140,
    "sports",
    "https://images.unsplash.com/photo-1518611012118-f8473d0b6f4d?auto=format&fit=crop&w=600&q=80"
);
// ====================== BOOKS ======================

createProductIfMissing(
    "SKU-1041",
    "Atomic Habits",
    "James Clear's bestselling book on building good habits and breaking bad ones.",
    599,
    180,
    "books",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1042",
    "Rich Dad Poor Dad",
    "Robert Kiyosaki's personal finance classic for wealth creation.",
    499,
    160,
    "books",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1043",
    "The Psychology of Money",
    "Morgan Housel explains how people think about money and investing.",
    549,
    140,
    "books",
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1044",
    "Ikigai",
    "Discover the Japanese secret to a long and happy life.",
    399,
    175,
    "books",
    "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1045",
    "Deep Work",
    "Cal Newport's guide to focused success in a distracted world.",
    699,
    90,
    "books",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80"
);

// ====================== BEAUTY ======================

createProductIfMissing(
    "SKU-1046",
    "Maybelline Fit Me Foundation",
    "Matte + Poreless liquid foundation suitable for normal to oily skin.",
    699,
    210,
    "beauty",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1047",
    "Lakme Absolute Matte Lipstick",
    "Long-lasting matte lipstick with rich pigmentation and smooth finish.",
    899,
    150,
    "beauty",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1048",
    "L'Oréal Paris Revitalift Serum",
    "Hyaluronic acid serum for hydrated and youthful-looking skin.",
    1199,
    95,
    "beauty",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1049",
    "Cetaphil Gentle Skin Cleanser",
    "Dermatologist-recommended daily cleanser for sensitive skin.",
    699,
    170,
    "beauty",
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80"
);

createProductIfMissing(
    "SKU-1050",
    "Nivea Soft Moisturizing Cream",
    "Lightweight moisturizing cream enriched with Vitamin E and Jojoba Oil.",
    349,
    260,
    "beauty",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80"
);

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
