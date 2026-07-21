package com.ecommerce.controller;

import com.ecommerce.dto.CartAddRequest;
import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.CartUpdateRequest;
import com.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("isAuthenticated()")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @GetMapping
    public ResponseEntity<CartDTO> getCart(Authentication auth) {
        Long userId = (Long) auth.getDetails();
        CartDTO cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }
    
    @PostMapping("/add/{productId}")
    public ResponseEntity<CartDTO> addToCart(@PathVariable Long productId, 
                                            @RequestParam(defaultValue = "1") Integer quantity,
                                            Authentication auth) {
        Long userId = (Long) auth.getDetails();
        CartDTO cart = cartService.addToCart(userId, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PostMapping
    public ResponseEntity<CartDTO> addToCart(@RequestBody CartAddRequest request, Authentication auth) {
        Long userId = (Long) auth.getDetails();
        CartDTO cart = cartService.addToCart(userId, request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(cart);
    }
    
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartDTO> removeFromCart(@PathVariable Long productId, Authentication auth) {
        Long userId = (Long) auth.getDetails();
        CartDTO cart = cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok(cart);
    }
    
    @PutMapping("/update/{productId}")
    public ResponseEntity<CartDTO> updateCartItemQuantity(@PathVariable Long productId, 
                                                         @RequestParam Integer quantity,
                                                         Authentication auth) {
        Long userId = (Long) auth.getDetails();
        CartDTO cart = cartService.updateCartItemQuantity(userId, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<CartDTO> updateCartItemQuantity(@PathVariable Long productId,
                                                         @RequestBody CartUpdateRequest request,
                                                         Authentication auth) {
        Long userId = (Long) auth.getDetails();
        Integer quantity = request.getQuantity();
        if (quantity == null) {
            throw new RuntimeException("Quantity is required");
        }
        CartDTO cart = cartService.updateCartItemQuantity(userId, productId, quantity);
        return ResponseEntity.ok(cart);
    }
    
    @DeleteMapping({"", "/clear"})
    public ResponseEntity<CartDTO> clearCart(Authentication auth) {
        Long userId = (Long) auth.getDetails();
        CartDTO cart = cartService.clearCart(userId);
        return ResponseEntity.ok(cart);
    }
}
