package com.ecommerce.service;

import com.ecommerce.dto.AddressDTO;
import com.ecommerce.dto.OrderCreateRequest;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderItemDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.*;
import com.ecommerce.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private UserService userService;
    
    public OrderDTO createOrderFromCart(Long userId, OrderCreateRequest request) {
        User user = userService.getUserById(userId);
        Cart cart = user.getCart();
        
        if (cart == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setTotalPrice(cart.getTotalPrice());
        order.setNotes(request.getNotes());
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setTrackingNumber(null);
        try {
            order.setShippingAddress(OBJECT_MAPPER.writeValueAsString(request.getShippingAddress()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize shipping address", e);
        }
        
        // Copy cart items to order items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            order.getItems().add(orderItem);
            
            // Reduce product stock
            Product product = cartItem.getProduct();
            product.setStock(product.getStock() - cartItem.getQuantity());
        }
        
        order = orderRepository.save(order);
        
        // Clear the cart
        cartService.clearCart(userId);
        
        return convertToDTO(order);
    }
    
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Order not found with id: " + id));
        return convertToDTO(order);
    }
    
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<OrderDTO> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public OrderDTO updateOrderStatus(Long id, Order.OrderStatus status, String trackingNumber) {
        Order order = orderRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Order not found with id: " + id));
        
        order.setStatus(status);
        if (trackingNumber != null && !trackingNumber.isEmpty()) {
            order.setTrackingNumber(trackingNumber);
        }
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);
        return convertToDTO(order);
    }
    
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private OrderDTO convertToDTO(Order order) {
        String status = order.getStatus().toString();
        if ("PROCESSING".equalsIgnoreCase(status)) {
            status = "processing";
        } else {
            status = status.toLowerCase();
        }

        return OrderDTO.builder()
                .id(order.getId())
                .status(status)
                .totalPrice(order.getTotalPrice())
                .shippingAddress(parseShippingAddress(order.getShippingAddress()))
                .paymentMethod(order.getPaymentMethod())
                .trackingNumber(order.getTrackingNumber())
                .notes(order.getNotes())
                .items(order.getItems().stream()
                        .map(this::convertItemToDTO)
                        .collect(Collectors.toSet()))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private AddressDTO parseShippingAddress(String shippingAddressJson) {
        if (shippingAddressJson == null || shippingAddressJson.isBlank()) {
            return new AddressDTO();
        }

        try {
            return OBJECT_MAPPER.readValue(shippingAddressJson, AddressDTO.class);
        } catch (JsonProcessingException ex) {
            AddressDTO fallback = new AddressDTO();
            fallback.setFullName(shippingAddressJson);
            return fallback;
        }
    }
    
    private OrderItemDTO convertItemToDTO(OrderItem item) {
        ProductDTO productDTO = ProductDTO.builder()
                .id(item.getProduct().getId())
                .sku(item.getProduct().getSku())
                .name(item.getProduct().getName())
                .description(item.getProduct().getDescription())
                .price(item.getProduct().getPrice())
                .stock(item.getProduct().getStock())
                .category(item.getProduct().getCategory())
                .imageUrl(item.getProduct().getImageUrl())
                .active(item.getProduct().getActive())
                .build();
        
        return OrderItemDTO.builder()
                .id(item.getId())
                .product(productDTO)
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}
