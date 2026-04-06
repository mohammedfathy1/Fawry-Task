package com.fawry.task.fawrytask.dto.shopping;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingListResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private String productCategory;
    private Double estimatedPrice;
    private Double calories;
    private String ingredients;
    private Integer quantity;
    private Double totalPrice;
    private LocalDateTime addedAt;
}

