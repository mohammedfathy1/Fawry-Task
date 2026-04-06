package com.fawry.task.fawrytask.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String externalId;
    private String name;
    private String category;
    private String area;
    private String thumbnail;
    private String tags;
    private String instructions;
    private String ingredients;
    private Double estimatedPrice;
    private Double calories;
    private String brand;
    private String nutrients;
    private Boolean approved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

