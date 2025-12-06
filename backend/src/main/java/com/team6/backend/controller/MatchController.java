package com.team6.backend.controller;

import com.team6.backend.model.Match;
import com.team6.backend.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchController {
    
    @Autowired
    private MatchService matchService;
    
    /**
     * Get all matches for a user
     * GET /api/matches/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserMatches(@PathVariable String userId) {
        try {
            UUID userUUID = UUID.fromString(userId);
            List<Match> matches = matchService.getUserMatches(userUUID);
            return ResponseEntity.ok(matches);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving matches: " + e.getMessage()));
        }
    }
    
    /**
     * Get only active matches for a user
     * GET /api/matches/user/{userId}/active
     */
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<?> getActiveUserMatches(@PathVariable String userId) {
        try {
            UUID userUUID = UUID.fromString(userId);
            List<Match> matches = matchService.getActiveUserMatches(userUUID);
            return ResponseEntity.ok(matches);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving active matches: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a match
     * DELETE /api/matches/{matchId}
     */
    @DeleteMapping("/{matchId}")
    public ResponseEntity<?> deleteMatch(@PathVariable String matchId) {
        try {
            UUID matchUUID = UUID.fromString(matchId);
            matchService.deleteMatch(matchUUID);
            return ResponseEntity.ok(Map.of("message", "Match deleted successfully"));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid match ID format"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error deleting match: " + e.getMessage()));
        }
    }
    
    /**
     * Deactivate a match (soft delete)
     * PUT /api/matches/{matchId}/deactivate
     */
    @PutMapping("/{matchId}/deactivate")
    public ResponseEntity<?> deactivateMatch(@PathVariable String matchId) {
        try {
            UUID matchUUID = UUID.fromString(matchId);
            Match match = matchService.deactivateMatch(matchUUID);
            return ResponseEntity.ok(match);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid match ID format"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error deactivating match: " + e.getMessage()));
        }
    }
}

