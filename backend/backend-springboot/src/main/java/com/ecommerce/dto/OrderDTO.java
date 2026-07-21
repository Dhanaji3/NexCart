package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private String status;
    @JsonIgnore
    private BigDecimal totalPrice;
    private AddressDTO shippingAddress;
    private String paymentMethod;
    private String trackingNumber;
    private String notes;
    private Set<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("total")
    public Number getTotal() {
        return totalPrice != null ? totalPrice : BigDecimal.ZERO;
    }
}
