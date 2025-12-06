package com.team6.backend.service;

import com.team6.backend.model.Profile;
import com.team6.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProfileService {
    
    @Autowired
    private ProfileRepository profileRepository;
    
    /**
     * Create a new profile
     */
    public Profile createProfile(Profile profile) {
        if (profile.getUserId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        // Check if profile already exists for this user
        Optional<Profile> existing = profileRepository.findByUserId(profile.getUserId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Profile already exists for user ID: " + profile.getUserId());
        }
        
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        
        return profileRepository.save(profile);
    }
    
    /**
     * Get profile by user ID
     */
    public Optional<Profile> getProfileByUserId(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return profileRepository.findByUserId(userId);
    }
    
    /**
     * Update an existing profile
     */
    public Profile updateProfile(UUID userId, Profile profileData) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        Profile existingProfile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user ID: " + userId));
        
        // Update fields - only update if provided
        if (profileData.getEmail() != null) {
            existingProfile.setEmail(profileData.getEmail());
        }
        if (profileData.getFullName() != null) {
            existingProfile.setFullName(profileData.getFullName());
        }
        if (profileData.getAge() != null) {
            existingProfile.setAge(profileData.getAge());
        }
        if (profileData.getMajor() != null) {
            existingProfile.setMajor(profileData.getMajor());
        }
        if (profileData.getSchool() != null) {
            existingProfile.setSchool(profileData.getSchool());
        }
        if (profileData.getYear() != null) {
            existingProfile.setYear(profileData.getYear());
        }
        if (profileData.getBio() != null) {
            existingProfile.setBio(profileData.getBio());
        }
        
        // Budget and cleanliness fields - always update (allow explicit null to clear)
        // Only update if present in request (frontend sends these fields)
        existingProfile.setBudgetMin(profileData.getBudgetMin());
        existingProfile.setBudgetMax(profileData.getBudgetMax());
        existingProfile.setCleanlinessRating(profileData.getCleanlinessRating());
        
        existingProfile.setUpdatedAt(LocalDateTime.now());
        
        return profileRepository.save(existingProfile);
    }
    
    /**
     * Get all profiles, optionally excluding a specific user
     */
    public List<Profile> getAllProfiles(UUID excludeUserId) {
        if (excludeUserId != null) {
            return profileRepository.findByUserIdNot(excludeUserId);
        }
        return profileRepository.findAll();
    }
    
    /**
     * Delete profile by user ID
     */
    public void deleteProfile(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user ID: " + userId));
        profileRepository.delete(profile);
    }
}

