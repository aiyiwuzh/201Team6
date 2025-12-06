package com.team6.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "swipes", schema = "public")
public class Swipe {
    
    @Id
    @GeneratedValue
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;
    
    @JsonProperty("swiper_id")
    @Column(name = "swiper_id", nullable = false, columnDefinition = "uuid")
    private UUID swiperId;
    
    @JsonProperty("swiped_id")
    @Column(name = "swiped_id", nullable = false, columnDefinition = "uuid")
    private UUID swipedId;
    
    @Column(name = "action", nullable = false)
    private String action; // 'approve' or 'decline'
    
    @JsonProperty("is_approved")
    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved;
    
    @JsonProperty("created_at")
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    // Constructors
    public Swipe() {
        this.createdAt = LocalDateTime.now();
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getSwiperId() {
        return swiperId;
    }
    
    public void setSwiperId(UUID swiperId) {
        this.swiperId = swiperId;
    }
    
    public UUID getSwipedId() {
        return swipedId;
    }
    
    public void setSwipedId(UUID swipedId) {
        this.swipedId = swipedId;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public Boolean getIsApproved() {
        return isApproved;
    }
    
    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        timestamp = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        timestamp = LocalDateTime.now();
    }
}

