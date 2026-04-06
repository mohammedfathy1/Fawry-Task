package com.fawry.task.fawrytask.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fawry.task.fawrytask.dto.meal.MealDbMeal;
import com.fawry.task.fawrytask.dto.product.BulkImportRequest;
import com.fawry.task.fawrytask.dto.product.ProductRequest;
import com.fawry.task.fawrytask.dto.product.ProductResponse;
import com.fawry.task.fawrytask.entity.Product;
import com.fawry.task.fawrytask.exception.ResourceNotFoundException;
import com.fawry.task.fawrytask.repository.ProductRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final MealDbService mealDbService;
    private final ObjectMapper objectMapper;


    public ProductResponse importFromMealDb(String externalId, ProductRequest overrides) {
        if (productRepository.existsByExternalId(externalId)) {
            throw new IllegalStateException("Product with external ID '" + externalId + "' is already imported.");
        }

        MealDbMeal meal = mealDbService.getMealById(externalId);
        if (meal == null) {
            throw new ResourceNotFoundException("Meal not found in TheMealDB with id: " + externalId);
        }

        Product product = mealToProduct(meal);

        if (overrides != null) {
            if (overrides.getEstimatedPrice() != null) product.setEstimatedPrice(overrides.getEstimatedPrice());
            if (overrides.getCalories() != null) product.setCalories(overrides.getCalories());
            if (overrides.getBrand() != null) product.setBrand(overrides.getBrand());
            if (overrides.getNutrients() != null) product.setNutrients(overrides.getNutrients());
            if (overrides.getApproved() != null) product.setApproved(overrides.getApproved());
        }

        return toResponse(productRepository.save(product));
    }


    public ProductResponse createProduct(ProductRequest request) {
        if (request.getExternalId() != null
                && productRepository.existsByExternalId(request.getExternalId())) {
            throw new IllegalStateException("Product with external ID '" + request.getExternalId() + "' already exists.");
        }

        Product product = Product.builder()
                .externalId(request.getExternalId())
                .name(request.getName())
                .category(request.getCategory())
                .area(request.getArea())
                .thumbnail(request.getThumbnail())
                .tags(request.getTags())
                .instructions(request.getInstructions())
                .ingredients(request.getIngredients())
                .estimatedPrice(request.getEstimatedPrice() != null ? request.getEstimatedPrice() : 0.0)
                .calories(request.getCalories() != null ? request.getCalories() : 0.0)
                .brand(request.getBrand())
                .nutrients(request.getNutrients())
                .approved(request.getApproved() != null ? request.getApproved() : false)
                .build();

        return toResponse(productRepository.save(product));
    }


    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProductById(id);

        if (request.getName() != null) product.setName(request.getName());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getArea() != null) product.setArea(request.getArea());
        if (request.getThumbnail() != null) product.setThumbnail(request.getThumbnail());
        if (request.getTags() != null) product.setTags(request.getTags());
        if (request.getInstructions() != null) product.setInstructions(request.getInstructions());
        if (request.getIngredients() != null) product.setIngredients(request.getIngredients());
        if (request.getEstimatedPrice() != null) product.setEstimatedPrice(request.getEstimatedPrice());
        if (request.getCalories() != null) product.setCalories(request.getCalories());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getNutrients() != null) product.setNutrients(request.getNutrients());
        if (request.getApproved() != null) product.setApproved(request.getApproved());

        return toResponse(productRepository.save(product));
    }


    public ProductResponse approveProduct(Long id) {
        Product product = findProductById(id);
        product.setApproved(true);
        return toResponse(productRepository.save(product));
    }


    public ProductResponse unapproveProduct(Long id) {
        Product product = findProductById(id);
        product.setApproved(false);
        return toResponse(productRepository.save(product));
    }


    public void deleteProduct(Long id) {
        Product product = findProductById(id);
        productRepository.delete(product);
    }


    public Map<String, Object> bulkImport(BulkImportRequest request) {
        List<ProductResponse> imported = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<String> failed = new ArrayList<>();

        for (String externalId : request.getExternalIds()) {
            try {
                if (productRepository.existsByExternalId(externalId)) {
                    skipped.add(externalId + " (already exists)");
                    continue;
                }

                MealDbMeal meal = mealDbService.getMealById(externalId);
                if (meal == null) {
                    failed.add(externalId + " (not found in TheMealDB)");
                    continue;
                }

                Product product = mealToProduct(meal);
                product.setEstimatedPrice(request.getDefaultPrice() != null ? request.getDefaultPrice() : 0.0);
                product.setCalories(request.getDefaultCalories() != null ? request.getDefaultCalories() : 0.0);
                product.setApproved(request.getAutoApprove() != null && request.getAutoApprove());

                imported.add(toResponse(productRepository.save(product)));
            } catch (Exception e) {
                failed.add(externalId + " (error: " + e.getMessage() + ")");
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("imported", imported);
        result.put("importedCount", imported.size());
        result.put("skipped", skipped);
        result.put("failed", failed);
        return result;
    }


    public Page<ProductResponse> getAllProducts(String name, String category, Pageable pageable) {
        return productRepository.searchAll(name, category, pageable).map(this::toResponse);
    }


    public ProductResponse getProductById(Long id) {
        return toResponse(findProductById(id));
    }


    public Page<ProductResponse> getApprovedProducts(String name, String category, Pageable pageable) {
        return productRepository.searchApproved(name, category, pageable).map(this::toResponse);
    }


    public ProductResponse getApprovedProductById(Long id) {
        Product product = findProductById(id);
        if (!product.getApproved()) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        return toResponse(product);
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private Product mealToProduct(MealDbMeal meal) {
        String ingredientsJson = buildIngredientsJson(meal);

        return Product.builder()
                .externalId(meal.getIdMeal())
                .name(meal.getStrMeal())
                .category(meal.getStrCategory())
                .area(meal.getStrArea())
                .thumbnail(meal.getStrMealThumb())
                .tags(meal.getStrTags())
                .instructions(meal.getStrInstructions())
                .ingredients(ingredientsJson)
                .estimatedPrice(0.0)
                .calories(0.0)
                .approved(false)
                .build();
    }

    private String buildIngredientsJson(MealDbMeal meal) {
        List<Map<String, String>> list = new ArrayList<>();

        String[] ingredients = {
            meal.getStrIngredient1(), meal.getStrIngredient2(), meal.getStrIngredient3(),
            meal.getStrIngredient4(), meal.getStrIngredient5(), meal.getStrIngredient6(),
            meal.getStrIngredient7(), meal.getStrIngredient8(), meal.getStrIngredient9(),
            meal.getStrIngredient10(), meal.getStrIngredient11(), meal.getStrIngredient12(),
            meal.getStrIngredient13(), meal.getStrIngredient14(), meal.getStrIngredient15(),
            meal.getStrIngredient16(), meal.getStrIngredient17(), meal.getStrIngredient18(),
            meal.getStrIngredient19(), meal.getStrIngredient20()
        };
        String[] measures = {
            meal.getStrMeasure1(), meal.getStrMeasure2(), meal.getStrMeasure3(),
            meal.getStrMeasure4(), meal.getStrMeasure5(), meal.getStrMeasure6(),
            meal.getStrMeasure7(), meal.getStrMeasure8(), meal.getStrMeasure9(),
            meal.getStrMeasure10(), meal.getStrMeasure11(), meal.getStrMeasure12(),
            meal.getStrMeasure13(), meal.getStrMeasure14(), meal.getStrMeasure15(),
            meal.getStrMeasure16(), meal.getStrMeasure17(), meal.getStrMeasure18(),
            meal.getStrMeasure19(), meal.getStrMeasure20()
        };

        for (int i = 0; i < ingredients.length; i++) {
            if (ingredients[i] != null && !ingredients[i].isBlank()) {
                Map<String, String> entry = new HashMap<>();
                entry.put("ingredient", ingredients[i].trim());
                entry.put("measure", measures[i] != null ? measures[i].trim() : "");
                list.add(entry);
            }
        }

        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    public ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .externalId(product.getExternalId())
                .name(product.getName())
                .category(product.getCategory())
                .area(product.getArea())
                .thumbnail(product.getThumbnail())
                .tags(product.getTags())
                .instructions(product.getInstructions())
                .ingredients(product.getIngredients())
                .estimatedPrice(product.getEstimatedPrice())
                .calories(product.getCalories())
                .brand(product.getBrand())
                .nutrients(product.getNutrients())
                .approved(product.getApproved())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}

