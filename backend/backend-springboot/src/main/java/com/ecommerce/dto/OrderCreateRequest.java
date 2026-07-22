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
public class OrderCreateRequest {
    private AddressDTO shippingAddress;
    private String paymentMethod;
    private String notes;
    private List<OrderItemRequest> items;
}
