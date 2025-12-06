package com.team6.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches", schema = "public")
public class Match {
    
    @Id
    @GeneratedValue
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;
    
    @JsonProperty("user1_id")
    @Column(name = "user1_id", nullable = false, columnDefinition = "uuid")
    private UUID user1Id;
    
    @JsonProperty("user2_id")
    @Column(name = "user2_id", nullable = false, columnDefinition = "uuid")
    private UUID user2Id;
    
    @JsonProperty("is_active")
    @Column(name = "is_active")
    private Boolean isActive;
    
    @JsonProperty("created_at")
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @JsonProperty("matched_at")
    @Column(name = "matched_at", nullable = false)
    private LocalDateTime matchedAt;
    
    // Constructors
    public Match() {
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.matchedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getUser1Id() {
        return user1Id;
    }
    
    public void setUser1Id(UUID user1Id) {
        this.user1Id = user1Id;
    }
    
    public UUID getUser2Id() {
        return user2Id;
    }
    
    public void setUser2Id(UUID user2Id) {
        this.user2Id = user2Id;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getMatchedAt() {
        return matchedAt;
    }
    
    public void setMatchedAt(LocalDateTime matchedAt) {
        this.matchedAt = matchedAt;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        matchedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }
}

