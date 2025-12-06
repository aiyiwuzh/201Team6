package com.team6.backend.controller;

import com.team6.backend.model.Swipe;
import com.team6.backend.service.SwipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/swipes")
@CrossOrigin(origins = "http://localhost:5173")
public class SwipeController {
    
    @Autowired
    private SwipeService swipeService;
    
    /**
     * Create a swipe and check for match
     * POST /api/swipes
     * Body: { "swiper_id": "uuid", "swiped_id": "uuid", "action": "approve|decline" }
     * Returns: { "swipe": Swipe, "match": Match|null }
     */
    @PostMapping
    public ResponseEntity<?> createSwipe(@RequestBody Map<String, String> body) {
        try {
            UUID swiperId = UUID.fromString(body.get("swiper_id"));
            UUID swipedId = UUID.fromString(body.get("swiped_id"));
            String action = body.get("action");
            
            Map<String, Object> result = swipeService.createSwipe(swiperId, swipedId, action);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating swipe: " + e.getMessage()));
        }
    }
    
    /**
     * Get all swipes for a user
     * GET /api/swipes/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserSwipes(@PathVariable String userId) {
        try {
            UUID userUUID = UUID.fromString(userId);
            List<Swipe> swipes = swipeService.getUserSwipes(userUUID);
            return ResponseEntity.ok(swipes);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving swipes: " + e.getMessage()));
        }
    }
    
    /**
     * Check if a swipe exists between two users
     * GET /api/swipes/check?swiper={uuid}&swiped={uuid}
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkSwipe(
            @RequestParam String swiper,
            @RequestParam String swiped) {
        try {
            UUID swiperUUID = UUID.fromString(swiper);
            UUID swipedUUID = UUID.fromString(swiped);
            
            Optional<Swipe> swipe = swipeService.getSwipe(swiperUUID, swipedUUID);
            
            if (swipe.isPresent()) {
                return ResponseEntity.ok(swipe.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No swipe found"));
            }
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid UUID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error checking swipe: " + e.getMessage()));
        }
    }
}

