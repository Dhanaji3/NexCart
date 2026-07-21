package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String category;
    @JsonIgnore
    private String imageUrl;

    @JsonProperty("image")
    public String getImage() {
        return imageUrl;
    }

    @JsonProperty("image")
    public void setImage(String image) {
        this.imageUrl = image;
    }
    
    @JsonProperty("inStock")
    public Boolean getInStock() {
        return stock != null && stock > 0;
    }

    @JsonProperty("inStock")
    public void setInStock(Boolean inStock) {
        if (inStock == null) {
            return;
        }
        this.stock = inStock ? Math.max(1, this.stock != null ? this.stock : 1) : 0;
    }
    
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
