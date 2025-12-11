package com.team6.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles", schema = "public")
public class Profile {
    
    @Id
    @GeneratedValue
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @JsonProperty("user_id")
    @Column(name = "user_id", nullable = false, unique = true, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "email")
    private String email;

    @JsonProperty("full_name")
    @Column(name = "full_name")
    private String fullName;

    @Column(name = "age")
    private Integer age;

    @Column(name = "major")
    private String major;

    @Column(name = "school")
    private String school;

    @Column(name = "year")
    private String year;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @JsonProperty("budget_min")
    @Column(name = "budget_min")
    private BigDecimal budgetMin;

    @JsonProperty("budget_max")
    @Column(name = "budget_max")
    private BigDecimal budgetMax;

    // ------------------------------
    // Lifestyle Fields (NEW)
    // ------------------------------

    @JsonProperty("cleanliness_rating")
    @Column(name = "cleanliness_rating")
    private Integer cleanlinessRating;   // 1–10 slider

    @JsonProperty("social_level")
    @Column(name = "social_level")
    private Integer socialLevel;         // 1–10 slider

    @JsonProperty("study_habits")
    @Column(name = "study_habits")
    private String studyHabits;          // "Quiet", "Normal", "Flexible"

    @JsonProperty("sleep_schedule")
    @Column(name = "sleep_schedule")
    private String sleepSchedule;        // "Early", "Normal", "Late", "Flexible"

    @JsonProperty("guests")
    @Column(name = "guests")
    private String guests;               // "Rarely", "Sometimes", "Often"

    @JsonProperty("drinking")
    @Column(name = "drinking")
    private String drinking;             // "Never", "Rarely", "Socially", "Frequently"

    // Optional profile photo URL (public URL or storage reference)
    @JsonProperty("photo_url")
    @Column(name = "photo_url")
    private String photoUrl;

    // ------------------------------
    // Timestamps
    // ------------------------------

    @JsonProperty("created_at")
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ------------------------------
    // Constructors
    // ------------------------------

    public Profile() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ------------------------------
    // Getters and Setters
    // ------------------------------

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public BigDecimal getBudgetMin() {
        return budgetMin;
    }

    public void setBudgetMin(BigDecimal budgetMin) {
        this.budgetMin = budgetMin;
    }

    public BigDecimal getBudgetMax() {
        return budgetMax;
    }

    public void setBudgetMax(BigDecimal budgetMax) {
        this.budgetMax = budgetMax;
    }

    public Integer getCleanlinessRating() {
        return cleanlinessRating;
    }

    public void setCleanlinessRating(Integer cleanlinessRating) {
        this.cleanlinessRating = cleanlinessRating;
    }

    public Integer getSocialLevel() {
        return socialLevel;
    }

    public void setSocialLevel(Integer socialLevel) {
        this.socialLevel = socialLevel;
    }

    public String getStudyHabits() {
        return studyHabits;
    }

    public void setStudyHabits(String studyHabits) {
        this.studyHabits = studyHabits;
    }

    public String getSleepSchedule() {
        return sleepSchedule;
    }

    public void setSleepSchedule(String sleepSchedule) {
        this.sleepSchedule = sleepSchedule;
    }

    public String getGuests() {
        return guests;
    }

    public void setGuests(String guests) {
        this.guests = guests;
    }

    public String getDrinking() {
        return drinking;
    }

    public void setDrinking(String drinking) {
        this.drinking = drinking;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}