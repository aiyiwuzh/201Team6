package com.team6.backend.controller;

import com.team6.backend.model.Profile;
import com.team6.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {
    
    @Autowired
    private ProfileService profileService;
    
    /**
     * Create a new profile
     * POST /api/profiles
     */
    @PostMapping
    public ResponseEntity<?> createProfile(@RequestBody Profile profile) {
        try {
            Profile createdProfile = profileService.createProfile(profile);
            return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating profile: " + e.getMessage());
        }
    }
    
    /**
     * Get profile by user ID
     * GET /api/profiles/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable String userId) {
        try {
            UUID userUUID = UUID.fromString(userId);
            Optional<Profile> profile = profileService.getProfileByUserId(userUUID);
            
            if (profile.isPresent()) {
                return ResponseEntity.ok(profile.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Profile not found for user ID: " + userId);
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format: " + userId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving profile: " + e.getMessage());
        }
    }
    
    /**
     * Update profile by user ID
     * PUT /api/profiles/user/{userId}
     */
    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable String userId, @RequestBody Profile profileData) {
        try {
            UUID userUUID = UUID.fromString(userId);
            Profile updatedProfile = profileService.updateProfile(userUUID, profileData);
            return ResponseEntity.ok(updatedProfile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format: " + userId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating profile: " + e.getMessage());
        }
    }
    
    /**
     * Get all profiles, optionally excluding a specific user
     * GET /api/profiles?excludeUserId={userId}
     */
    @GetMapping
    public ResponseEntity<?> getAllProfiles(@RequestParam(required = false) String excludeUserId) {
        try {
            UUID excludeUUID = null;
            if (excludeUserId != null && !excludeUserId.isEmpty()) {
                excludeUUID = UUID.fromString(excludeUserId);
            }
            
            List<Profile> profiles = profileService.getAllProfiles(excludeUUID);
            return ResponseEntity.ok(profiles);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid exclude user ID format: " + excludeUserId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving profiles: " + e.getMessage());
        }
    }
    
    /**
     * Delete profile by user ID
     * DELETE /api/profiles/user/{userId}
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteProfile(@PathVariable String userId) {
        try {
            UUID userUUID = UUID.fromString(userId);
            profileService.deleteProfile(userUUID);
            return ResponseEntity.ok("Profile deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format: " + userId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting profile: " + e.getMessage());
        }
    }
}

