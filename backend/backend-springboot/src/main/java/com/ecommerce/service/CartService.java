package com.ecommerce.service;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private ProductService productService;
    
    public CartDTO getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() ->
                new RuntimeException("Cart not found for user: " + userId));
        return convertToDTO(cart);
    }
    
    public CartDTO addToCart(Long userId, Long productId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() ->
                new RuntimeException("Cart not found for user: " + userId));
        
        Product product = productService.getProductEntityById(productId);
        
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.setAddedAt(LocalDateTime.now());
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setAddedAt(LocalDateTime.now());
            cart.getItems().add(newItem);
        }
        
        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);
        return convertToDTO(cart);
    }
    
    public CartDTO removeFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() ->
                new RuntimeException("Cart not found for user: " + userId));
        
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);
        return convertToDTO(cart);
    }
    
    public CartDTO updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() ->
                new RuntimeException("Cart not found for user: " + userId));
        
        CartItem item = cart.getItems().stream()
                .filter(ci -> ci.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not in cart"));
        
        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
            item.setAddedAt(LocalDateTime.now());
        }
        
        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);
        return convertToDTO(cart);
    }
    
    public CartDTO clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() ->
                new RuntimeException("Cart not found for user: " + userId));
        
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);
        return convertToDTO(cart);
    }
    
    public Cart saveCart(Cart cart) {
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }
    
    private CartDTO convertToDTO(Cart cart) {
        return CartDTO.builder()
                .id(cart.getId())
                .items(cart.getItems().stream()
                        .map(this::convertItemToDTO)
                        .collect(Collectors.toSet()))
                .totalItems(cart.getTotalItems())
                .totalPrice(cart.getTotalPrice())
                .build();
    }
    
    private CartItemDTO convertItemToDTO(CartItem item) {
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
        
        return CartItemDTO.builder()
                .id(item.getId())
                .product(productDTO)
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }
}
