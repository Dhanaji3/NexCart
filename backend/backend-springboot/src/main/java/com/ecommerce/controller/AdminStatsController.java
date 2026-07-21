package com.ecommerce.controller;

import com.ecommerce.dto.AdminStatsDTO;
import com.ecommerce.dto.OrderStatusCountDTO;
import com.ecommerce.dto.RevenueDataDTO;
import com.ecommerce.service.OrderService;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> stats() {
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                System.out.println("[DEBUG] Authentication: " + auth);
                if (auth != null) {
                        System.out.println("[DEBUG] Principal: " + auth.getPrincipal());
                        System.out.println("[DEBUG] Authorities: " + auth.getAuthorities());
                        System.out.println("[DEBUG] Authenticated: " + auth.isAuthenticated());
                }
        double totalRevenue = orderRepository.findAll().stream()
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice().doubleValue() : 0d)
                .mapToDouble(Double::doubleValue)
                .sum();

        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();

        var recentOrders = orderService.getAllOrders();
        if (recentOrders.size() > 5) recentOrders = recentOrders.subList(0, 5);

        var revenueByMonth = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && o.getTotalPrice() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        o -> java.time.format.DateTimeFormatter.ofPattern("yyyy-MM").format(o.getCreatedAt()),
                        java.util.stream.Collectors.reducing(
                                new double[]{0d, 0d},
                                o -> new double[]{o.getTotalPrice().doubleValue(), 1d},
                                (a, b) -> new double[]{a[0] + b[0], a[1] + b[1]}
                        )
                ))
                .entrySet().stream()
                .map(e -> new RevenueDataDTO(e.getKey(), e.getValue()[0], (long) e.getValue()[1]))
                .sorted((a, b) -> b.getMonth().compareTo(a.getMonth()))
                .limit(6)
                .collect(Collectors.toList());

        var ordersByStatus = java.util.Arrays.stream(com.ecommerce.model.Order.OrderStatus.values())
                .map(s -> new OrderStatusCountDTO(s.toString().toLowerCase(), orderRepository.findByStatus(s).size()))
                .collect(Collectors.toList());

        AdminStatsDTO stats = AdminStatsDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalUsers(totalUsers)
                .recentOrders(recentOrders)
                .revenueByMonth(revenueByMonth)
                .ordersByStatus(ordersByStatus)
                .build();

        return ResponseEntity.ok(stats);
    }
}
