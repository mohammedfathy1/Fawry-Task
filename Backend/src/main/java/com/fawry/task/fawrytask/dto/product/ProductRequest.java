package com.fawry.task.fawrytask.dto.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductRequest {

    private String externalId;

    @NotBlank(message = "Product name is required")
    private String name;

    private String category;
    private String area;
    private String thumbnail;
    private String tags;
    private String instructions;

    private String ingredients;

    @Min(value = 0, message = "Estimated price must be positive")
    private Double estimatedPrice;

    @Min(value = 0, message = "Calories must be positive")
    private Double calories;

    private String brand;

    private String nutrients;

    private Boolean approved;
}

