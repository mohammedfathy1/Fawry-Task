package com.fawry.task.fawrytask.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String externalId;

    @Column(nullable = false)
    private String name;

    private String category;

    private String area;

    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    private String tags;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Builder.Default
    private Double estimatedPrice = 0.0;

    @Builder.Default
    private Double calories = 0.0;

    private String brand;

    @Column(columnDefinition = "TEXT")
    private String nutrients;

    @Builder.Default
    private Boolean approved = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

