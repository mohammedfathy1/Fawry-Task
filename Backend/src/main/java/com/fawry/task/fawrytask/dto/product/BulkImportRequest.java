package com.fawry.task.fawrytask.dto.product;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkImportRequest {

    @NotEmpty(message = "External IDs list cannot be empty")
    private List<String> externalIds;

    private Double defaultPrice = 0.0;

    private Double defaultCalories = 0.0;

    private Boolean autoApprove = false;
}

