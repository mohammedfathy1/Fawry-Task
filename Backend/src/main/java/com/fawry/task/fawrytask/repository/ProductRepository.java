package com.fawry.task.fawrytask.repository;

import com.fawry.task.fawrytask.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByExternalId(String externalId);

    Optional<Product> findByExternalId(String externalId);

    Page<Product> findAllByApprovedTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.approved = true " +
           "AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:category IS NULL OR LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%')))")
    Page<Product> searchApproved(@Param("name") String name,
                                 @Param("category") String category,
                                 Pageable pageable);

    @Query("SELECT p FROM Product p " +
           "WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:category IS NULL OR LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%')))")
    Page<Product> searchAll(@Param("name") String name,
                            @Param("category") String category,
                            Pageable pageable);
}

