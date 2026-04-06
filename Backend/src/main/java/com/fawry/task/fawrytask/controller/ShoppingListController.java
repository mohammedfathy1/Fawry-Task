package com.fawry.task.fawrytask.controller;

import com.fawry.task.fawrytask.dto.shopping.ShoppingListRequest;
import com.fawry.task.fawrytask.dto.shopping.ShoppingListResponse;
import com.fawry.task.fawrytask.service.ShoppingListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shopping-list")
@RequiredArgsConstructor
public class ShoppingListController {

    private final ShoppingListService shoppingListService;


    @GetMapping
    public ResponseEntity<List<ShoppingListResponse>> getMyShoppingList() {
        return ResponseEntity.ok(shoppingListService.getMyShoppingList());
    }


    @PostMapping
    public ResponseEntity<ShoppingListResponse> addItem(
            @Valid @RequestBody ShoppingListRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shoppingListService.addItem(request));
    }


    @PutMapping("/{id}")
    public ResponseEntity<ShoppingListResponse> updateQuantity(
            @PathVariable Long id,
            @RequestParam int quantity) {
        return ResponseEntity.ok(shoppingListService.updateItemQuantity(id, quantity));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable Long id) {
        shoppingListService.removeItem(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearShoppingList() {
        shoppingListService.clearMyShoppingList();
        return ResponseEntity.noContent().build();
    }
}

