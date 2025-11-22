package com.team6.backend.service;

import com.team6.backend.model.Item;
import com.team6.backend.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    
    @Autowired
    private ItemRepository itemRepository;
    
    // Create
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }
    
    // Read All
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
    
    // Read One
    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }
    
    // Update
    public Item updateItem(Long id, Item itemDetails) {
        Item item = itemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        
        item.setName(itemDetails.getName());
        item.setDescription(itemDetails.getDescription());
        
        return itemRepository.save(item);
    }
    
    // Delete
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        itemRepository.delete(item);
    }
    
    // Delete All
    public void deleteAllItems() {
        itemRepository.deleteAll();
    }
}

