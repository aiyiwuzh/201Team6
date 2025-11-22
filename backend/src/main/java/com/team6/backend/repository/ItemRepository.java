package com.team6.backend.repository;

import com.team6.backend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    // JpaRepository provides all basic CRUD operations:
    // - save()
    // - findAll()
    // - findById()
    // - deleteById()
    // - delete()
    // - count()
    // etc.
    
    // You can add custom query methods here if needed, for example:
    // List<Item> findByNameContaining(String name);
}

