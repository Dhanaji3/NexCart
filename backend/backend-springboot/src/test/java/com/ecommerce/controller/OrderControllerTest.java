package com.ecommerce.controller;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.service.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    @Test
    void getUserOrdersShouldReturnAllOrdersForAdmin() {
        Authentication auth = mock(Authentication.class);
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(auth.getDetails()).thenReturn(7L);
        when(auth.getAuthorities()).thenReturn((List) authorities);

        OrderDTO adminOrder = OrderDTO.builder().id(99L).build();
        when(orderService.getAllOrders()).thenReturn(List.of(adminOrder));

        ResponseEntity<List<OrderDTO>> response = orderController.getUserOrders(auth);

        assertEquals(1, response.getBody().size());
        assertEquals(99L, response.getBody().get(0).getId());
    }
}
