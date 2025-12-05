package com.team6.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    private String name;
    private String year;
    private String major;
    private String housingPreference;
    private Double budgetMin;
    private Double budgetMax;
    private String sleepSchedule;
    private Integer cleanlinessRating; // 1-5
    private Boolean hasPets;
    private Boolean smokes;
    
    @Column(columnDefinition = "TEXT")
    private String profileDataJson; // For storing additional traits
    
    private LocalDateTime createdAt;
    
    // Constructors
    public User() {
        this.createdAt = LocalDateTime.now();
    }
    
    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters (generate these in Eclipse: Right-click → Source → Generate Getters and Setters)
    // ... 

    // Getters & Setters…
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getYear() {
		return year;
	}

	public void setYear(String year) {
		this.year = year;
	}

	public String getMajor() {
		return major;
	}

	public void setMajor(String major) {
		this.major = major;
	}

	public String getHousingPreference() {
		return housingPreference;
	}

	public void setHousingPreference(String housingPreference) {
		this.housingPreference = housingPreference;
	}

	public Double getBudgetMin() {
		return budgetMin;
	}

	public void setBudgetMin(Double budgetMin) {
		this.budgetMin = budgetMin;
	}

	public Double getBudgetMax() {
		return budgetMax;
	}

	public void setBudgetMax(Double budgetMax) {
		this.budgetMax = budgetMax;
	}

	public String getSleepSchedule() {
		return sleepSchedule;
	}

	public void setSleepSchedule(String sleepSchedule) {
		this.sleepSchedule = sleepSchedule;
	}

	public Integer getCleanlinessRating() {
		return cleanlinessRating;
	}

	public void setCleanlinessRating(Integer cleanlinessRating) {
		this.cleanlinessRating = cleanlinessRating;
	}

	public Boolean getHasPets() {
		return hasPets;
	}

	public void setHasPets(Boolean hasPets) {
		this.hasPets = hasPets;
	}

	public Boolean getSmokes() {
		return smokes;
	}

	public void setSmokes(Boolean smokes) {
		this.smokes = smokes;
	}

	public String getProfileDataJson() {
		return profileDataJson;
	}

	public void setProfileDataJson(String profileDataJson) {
		this.profileDataJson = profileDataJson;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getPasswordHash() { return passwordHash; }
    public String getProfileJson() { return profileDataJson; }

    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setProfileJson(String profileJson) { this.profileDataJson = profileJson; }
}
