package com.team6.backend.controller;

import com.team6.backend.model.Item;
import com.team6.backend.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemController {
    
    @Autowired
    private ItemService itemService;
    
    // CREATE - POST /api/items
    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        try {
            Item createdItem = itemService.createItem(item);
            return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // READ ALL - GET /api/items
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        try {
            List<Item> items = itemService.getAllItems();
            if (items.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // READ ONE - GET /api/items/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable("id") Long id) {
        Optional<Item> item = itemService.getItemById(id);
        return item.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // UPDATE - PUT /api/items/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable("id") Long id, @RequestBody Item item) {
        try {
            Item updatedItem = itemService.updateItem(id, item);
            return new ResponseEntity<>(updatedItem, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // DELETE ONE - DELETE /api/items/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteItem(@PathVariable("id") Long id) {
        try {
            itemService.deleteItem(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // DELETE ALL - DELETE /api/items
    @DeleteMapping
    public ResponseEntity<HttpStatus> deleteAllItems() {
        try {
            itemService.deleteAllItems();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

