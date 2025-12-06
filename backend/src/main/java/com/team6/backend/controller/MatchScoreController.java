package com.team6.backend.controller;

import com.team6.backend.model.Profile;
import com.team6.backend.service.MatchScoreService;
import com.team6.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/match-score")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchScoreController {
    
    @Autowired
    private MatchScoreService matchScoreService;

    @Autowired
    private ProfileService profileService;
    
    /**
     * Calculate match score between two users
     * GET /api/match-score?user1={uuid}&user2={uuid}
     */
    @GetMapping
    public ResponseEntity<?> calculateMatchScore(
            @RequestParam String user1,
            @RequestParam String user2) {
        try {
            UUID user1UUID = UUID.fromString(user1);
            UUID user2UUID = UUID.fromString(user2);
            
            // Get both profiles
            Optional<Profile> profile1 = profileService.getProfileByUserId(user1UUID);
            Optional<Profile> profile2 = profileService.getProfileByUserId(user2UUID);
            
            if (profile1.isEmpty() || profile2.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "One or both profiles not found"));
            }
            
            // Calculate score
            int score = matchScoreService.calculateMatchScore(profile1.get(), profile2.get());
            String rating = matchScoreService.getCompatibilityRating(score);
            
            return ResponseEntity.ok(Map.of(
                "score", score,
                "rating", rating,
                "user1_id", user1,
                "user2_id", user2
            ));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid UUID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error calculating match score: " + e.getMessage()));
        }
    }
    
    /**
     * Get detailed match score breakdown
     * GET /api/match-score/detailed?user1={uuid}&user2={uuid}
     */
    @GetMapping("/detailed")
    public ResponseEntity<?> getDetailedMatchScore(
            @RequestParam String user1,
            @RequestParam String user2) {
        try {
            UUID user1UUID = UUID.fromString(user1);
            UUID user2UUID = UUID.fromString(user2);
            
            // Get both profiles
            Optional<Profile> profile1 = profileService.getProfileByUserId(user1UUID);
            Optional<Profile> profile2 = profileService.getProfileByUserId(user2UUID);
            
            if (profile1.isEmpty() || profile2.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "One or both profiles not found"));
            }
            
            // Get detailed breakdown
            Map<String, Object> breakdown = matchScoreService.getMatchScoreBreakdown(
                profile1.get(), profile2.get()
            );
            
            return ResponseEntity.ok(breakdown);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid UUID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error calculating detailed match score: " + e.getMessage()));
        }
    }
}

