package com.team6.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team6.backend.model.Profile;
import com.team6.backend.repository.ProfileRepository;

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
        if (profileData == null) {
            throw new IllegalArgumentException("Profile data cannot be null");
        }

        Profile existingProfile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user ID: " + userId));

        // ---------- BASIC INFO ----------
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

        // ---------- PHOTO ----------
        if (profileData.getPhotoUrl() != null) {
            existingProfile.setPhotoUrl(profileData.getPhotoUrl());
        }

        // ---------- HOUSING ----------
        validateBudget(
                profileData.getBudgetMin() != null ? profileData.getBudgetMin().doubleValue() : null,
                profileData.getBudgetMax() != null ? profileData.getBudgetMax().doubleValue() : null
        );

        existingProfile.setBudgetMin(profileData.getBudgetMin());
        existingProfile.setBudgetMax(profileData.getBudgetMax());

        // ---------- LIFESTYLE ----------
        validateLifestyle(
                profileData.getCleanlinessRating(),
                profileData.getSocialLevel(),
                profileData.getStudyHabits(),
                profileData.getSleepSchedule(),
                profileData.getGuests(),
                profileData.getDrinking()
        );

        if (profileData.getCleanlinessRating() != null) {
            existingProfile.setCleanlinessRating(profileData.getCleanlinessRating());
        }
        if (profileData.getSocialLevel() != null) {
            existingProfile.setSocialLevel(profileData.getSocialLevel());
        }
        if (profileData.getStudyHabits() != null) {
            existingProfile.setStudyHabits(profileData.getStudyHabits());
        }
        if (profileData.getSleepSchedule() != null) {
            existingProfile.setSleepSchedule(profileData.getSleepSchedule());
        }
        if (profileData.getGuests() != null) {
            existingProfile.setGuests(profileData.getGuests());
        }
        if (profileData.getDrinking() != null) {
            existingProfile.setDrinking(profileData.getDrinking());
        }

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
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user ID: " + userId));
        profileRepository.delete(profile);
    }

    // ---------- VALIDATION HELPERS ----------

    private void validateBudget(Double min, Double max) {
        if (min != null && min < 0) {
            throw new IllegalArgumentException("Minimum budget cannot be negative");
        }
        if (max != null && max < 0) {
            throw new IllegalArgumentException("Maximum budget cannot be negative");
        }
        if (min != null && max != null && max < min) {
            throw new IllegalArgumentException("Maximum budget must be >= minimum budget");
        }
    }

    private void validateLifestyle(Integer cleanliness, Integer socialLevel, String studyHabits,
                                   String sleepSchedule, String guests, String drinking) {

        if (cleanliness != null && (cleanliness < 1 || cleanliness > 10)) {
            throw new IllegalArgumentException("Cleanliness rating must be between 1 and 10");
        }
        if (socialLevel != null && (socialLevel < 1 || socialLevel > 10)) {
            throw new IllegalArgumentException("Social level must be between 1 and 10");
        }

        if (studyHabits != null && !isOneOf(studyHabits, "light", "balanced", "intense")) {
            throw new IllegalArgumentException("Invalid study habits value");
        }
        if (sleepSchedule != null && !isOneOf(sleepSchedule, "early", "late", "balanced")) {
            throw new IllegalArgumentException("Invalid sleep schedule value");
        }
        if (guests != null && !isOneOf(guests, "never", "rarely", "sometimes", "often")) {
            throw new IllegalArgumentException("Invalid guests value");
        }
        if (drinking != null && !isOneOf(drinking, "no", "yes")) {
            throw new IllegalArgumentException("Invalid drinking value");
        }
    }

    private boolean isOneOf(String value, String... allowed) {
        for (String a : allowed) {
            if (a.equalsIgnoreCase(value)) return true;
        }
        return false;
    }
}
