package com.fawry.task.fawrytask.service;

import com.fawry.task.fawrytask.dto.shopping.ShoppingListRequest;
import com.fawry.task.fawrytask.dto.shopping.ShoppingListResponse;
import com.fawry.task.fawrytask.entity.Product;
import com.fawry.task.fawrytask.entity.ShoppingListItem;
import com.fawry.task.fawrytask.entity.User;
import com.fawry.task.fawrytask.exception.ResourceNotFoundException;
import com.fawry.task.fawrytask.repository.ProductRepository;
import com.fawry.task.fawrytask.repository.ShoppingListItemRepository;
import com.fawry.task.fawrytask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShoppingListService {

    private final ShoppingListItemRepository shoppingListItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ShoppingListResponse> getMyShoppingList() {
        User user = getCurrentUser();
        return shoppingListItemRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ShoppingListResponse addItem(ShoppingListRequest request) {
        User user = getCurrentUser();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.getApproved()) {
            throw new IllegalStateException("Product is not available in the grocery list.");
        }

        if (shoppingListItemRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            ShoppingListItem item = shoppingListItemRepository
                    .findByUserIdAndProductId(user.getId(), product.getId())
                    .orElseThrow();
            item.setQuantity(item.getQuantity() + (request.getQuantity() != null ? request.getQuantity() : 1));
            return toResponse(shoppingListItemRepository.save(item));
        }

        ShoppingListItem item = ShoppingListItem.builder()
                .user(user)
                .product(product)
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .build();

        return toResponse(shoppingListItemRepository.save(item));
    }

    @Transactional
    public ShoppingListResponse updateItemQuantity(Long itemId, Integer quantity) {
        User user = getCurrentUser();

        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list item", "id", itemId));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied: item does not belong to the current user.");
        }

        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        item.setQuantity(quantity);
        return toResponse(shoppingListItemRepository.save(item));
    }

    @Transactional
    public void removeItem(Long itemId) {
        User user = getCurrentUser();

        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list item", "id", itemId));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied: item does not belong to the current user.");
        }

        shoppingListItemRepository.delete(item);
    }

    @Transactional
    public void clearMyShoppingList() {
        User user = getCurrentUser();
        shoppingListItemRepository.deleteAllByUserId(user.getId());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private ShoppingListResponse toResponse(ShoppingListItem item) {
        Product p = item.getProduct();
        double totalPrice = (p.getEstimatedPrice() != null ? p.getEstimatedPrice() : 0.0) * item.getQuantity();



        return ShoppingListResponse.builder()
                .id(item.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productThumbnail(p.getThumbnail())
                .productCategory(p.getCategory())
                .estimatedPrice(p.getEstimatedPrice())
                .calories(p.getCalories())
                .ingredients(p.getIngredients())
                .quantity(item.getQuantity())
                .totalPrice(totalPrice)
                .addedAt(item.getAddedAt())
                .build();
    }
}

