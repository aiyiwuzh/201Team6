package com.team6.backend.controller;

import com.team6.backend.model.Match;
import com.team6.backend.model.User;
import com.team6.backend.service.SwipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/swipes")
@CrossOrigin(origins = "http://localhost:5173")
public class SwipeController {
    
    @Autowired
    private SwipeService swipeService;
    
    /**
     * POST /api/swipes
     * Process a swipe (right or left)
     */
    @PostMapping
    public ResponseEntity<?> swipe(
            @RequestParam Long swipedUserId,
            @RequestParam boolean approved,
            @RequestHeader("X-User-ID") Long swiperUserId) {
        
        try {
            boolean isMatch = swipeService.processSwipe(swiperUserId, swipedUserId, approved);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isMatch", isMatch);
            response.put("message", isMatch ? "It's a match!" : "Swipe recorded");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
    
    /**
     * GET /api/swipes/next-candidate
     * Get next user to swipe on
     */
    @GetMapping("/next-candidate")
    public ResponseEntity<?> getNextCandidate(@RequestHeader("X-User-ID") Long userId) {
        Optional<User> candidate = swipeService.getNextCandidate(userId);
        
        if (candidate.isPresent()) {
            // Return candidate info (excluding sensitive data)
            Map<String, Object> candidateInfo = new HashMap<>();
            candidateInfo.put("id", candidate.get().getId());
            candidateInfo.put("name", candidate.get().getName());
            candidateInfo.put("year", candidate.get().getYear());
            candidateInfo.put("major", candidate.get().getMajor());
            candidateInfo.put("bio", "Looking for roommate"); // Add more fields as needed
            
            return ResponseEntity.ok(candidateInfo);
        } else {
            return ResponseEntity.ok(Map.of(
                "message", "No more candidates available",
                "isEmpty", true
            ));
        }
    }
    
    /**
     * GET /api/swipes/matches
     * Get all matches for the current user
     */
    @GetMapping("/matches")
    public ResponseEntity<?> getMatches(@RequestHeader("X-User-ID") Long userId) {
        List<Match> matches = swipeService.getUserMatches(userId);
        return ResponseEntity.ok(matches);
    }
}