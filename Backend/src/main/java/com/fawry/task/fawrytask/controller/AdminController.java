package com.fawry.task.fawrytask.controller;

import com.fawry.task.fawrytask.dto.meal.MealDbCategory;
import com.fawry.task.fawrytask.dto.meal.MealDbMeal;
import com.fawry.task.fawrytask.dto.product.BulkImportRequest;
import com.fawry.task.fawrytask.dto.product.ProductRequest;
import com.fawry.task.fawrytask.dto.product.ProductResponse;
import com.fawry.task.fawrytask.service.MealDbService;
import com.fawry.task.fawrytask.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final MealDbService mealDbService;
    private final ProductService productService;


    @GetMapping("/meals/search")
    public ResponseEntity<List<MealDbMeal>> searchMeals(
            @RequestParam(defaultValue = "") String query) {
        return ResponseEntity.ok(mealDbService.searchMealsByName(query));
    }


    @GetMapping("/meals/categories")
    public ResponseEntity<List<MealDbCategory>> getCategories() {
        return ResponseEntity.ok(mealDbService.getCategories());
    }


    @GetMapping("/meals/by-category")
    public ResponseEntity<List<MealDbMeal>> getMealsByCategory(
            @RequestParam String category) {
        return ResponseEntity.ok(mealDbService.searchMealsByCategory(category));
    }


    @GetMapping("/meals/{mealId}")
    public ResponseEntity<MealDbMeal> getMealById(@PathVariable String mealId) {
        MealDbMeal meal = mealDbService.getMealById(mealId);
        return meal != null ? ResponseEntity.ok(meal) : ResponseEntity.notFound().build();
    }


    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(productService.getAllProducts(name, category, pageable));
    }


    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }


    @PostMapping("/products/import/{mealId}")
    public ResponseEntity<ProductResponse> importMeal(
            @PathVariable String mealId,
            @RequestBody(required = false) ProductRequest overrides) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.importFromMealDb(mealId, overrides));
    }


    @PostMapping("/products/bulk-import")
    public ResponseEntity<Map<String, Object>> bulkImport(
            @Valid @RequestBody BulkImportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.bulkImport(request));
    }


    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(request));
    }


    @PatchMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }


    @PatchMapping("/products/{id}/approve")
    public ResponseEntity<ProductResponse> approveProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.approveProduct(id));
    }


    @PatchMapping("/products/{id}/unapprove")
    public ResponseEntity<ProductResponse> unapproveProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.unapproveProduct(id));
    }


    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}

