package com.fawry.task.fawrytask.dto.meal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MealDbResponse {
    private List<MealDbMeal> meals;
}

