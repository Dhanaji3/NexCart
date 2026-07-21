package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDTO {
    private double totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalUsers;
    private List<OrderDTO> recentOrders;
    private List<RevenueDataDTO> revenueByMonth;
    private List<OrderStatusCountDTO> ordersByStatus;
}
