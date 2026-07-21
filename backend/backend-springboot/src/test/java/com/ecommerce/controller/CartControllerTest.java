package com.ecommerce.controller;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.exception.GlobalExceptionHandler;
import com.ecommerce.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Set;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CartControllerTest {

    private MockMvc mockMvc;
    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartService = mock(CartService.class);
        CartController controller = new CartController();
        ReflectionTestUtils.setField(controller, "cartService", cartService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void updateCartItemQuantityAcceptsBodyAndPathVariable() throws Exception {
        CartDTO cart = CartDTO.builder()
                .id(1L)
                .items(Set.of())
                .totalItems(0)
                .totalPrice(BigDecimal.ZERO)
                .build();

        when(cartService.updateCartItemQuantity(eq(7L), eq(3L), eq(2))).thenReturn(cart);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken("user", null);
        authentication.setDetails(7L);

        mockMvc.perform(put("/api/cart/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":2}")
                        .principal(authentication))
                .andExpect(status().isOk());

        verify(cartService).updateCartItemQuantity(7L, 3L, 2);
    }
}
