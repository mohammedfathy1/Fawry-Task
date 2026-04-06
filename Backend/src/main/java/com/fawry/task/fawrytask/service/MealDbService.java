package com.fawry.task.fawrytask.service;

import com.fawry.task.fawrytask.dto.meal.MealDbCategory;
import com.fawry.task.fawrytask.dto.meal.MealDbCategoryResponse;
import com.fawry.task.fawrytask.dto.meal.MealDbMeal;
import com.fawry.task.fawrytask.dto.meal.MealDbResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MealDbService {

    private final RestClient mealDbRestClient;

    public List<MealDbMeal> searchMealsByName(String query) {
        try {
            MealDbResponse response = mealDbRestClient.get()
                    .uri("/search.php?s={query}", query)
                    .retrieve()
                    .body(MealDbResponse.class);

            return response != null && response.getMeals() != null
                    ? response.getMeals()
                    : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public List<MealDbMeal> searchMealsByCategory(String category) {
        try {
            MealDbResponse response = mealDbRestClient.get()
                    .uri("/filter.php?c={category}", category)
                    .retrieve()
                    .body(MealDbResponse.class);

            if (response == null || response.getMeals() == null) {
                return Collections.emptyList();
            }

            return response.getMeals().stream()
                    .map(m -> getMealById(m.getIdMeal()))
                    .filter(m -> m != null)
                    .toList();

        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public MealDbMeal getMealById(String mealId) {
        try {
            MealDbResponse response = mealDbRestClient.get()
                    .uri("/lookup.php?i={mealId}", mealId)
                    .retrieve()
                    .body(MealDbResponse.class);

            return (response != null && response.getMeals() != null && !response.getMeals().isEmpty())
                    ? response.getMeals().get(0)
                    : null;
        } catch (Exception e) {
            return null;
        }
    }

    public List<MealDbCategory> getCategories() {
        try {
            MealDbCategoryResponse response = mealDbRestClient.get()
                    .uri("/categories.php")
                    .retrieve()
                    .body(MealDbCategoryResponse.class);

            return response != null && response.getCategories() != null
                    ? response.getCategories()
                    : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}

