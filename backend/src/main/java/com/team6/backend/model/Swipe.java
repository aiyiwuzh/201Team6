package com.team6.backend.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "swipes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"swiper_user_id", "swiped_user_id"}))
public class Swipe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "swiper_user_id")
    private Long swiperUserId;
    
    @Column(name = "swiped_user_id")
    private Long swipedUserId;
    
    @Column(name = "is_approved")
    private Boolean isApproved; // true = right swipe, false = left swipe
    
    private LocalDateTime timestamp;
    
    public Swipe() {
        this.timestamp = LocalDateTime.now();
    }
    
    public Swipe(Long swiperUserId, Long swipedUserId, Boolean isApproved) {
        this.swiperUserId = swiperUserId;
        this.swipedUserId = swipedUserId;
        this.isApproved = isApproved;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and Setters
    // ...

    // Getters & Setters
    public Long getId() { return id; }
    public Long getSwiperUserId() { return swiperUserId; }
    public Long getSwipedUserId() { return swipedUserId; }
    public Boolean getApproved() { return isApproved; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public Boolean getIsApproved() {
		return isApproved;
	}

	public void setIsApproved(Boolean isApproved) {
		this.isApproved = isApproved;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	public void setSwiperUserId(Long swiperUserId) { this.swiperUserId = swiperUserId; }
    public void setSwipedUserId(Long swipedUserId) { this.swipedUserId = swipedUserId; }
    public void setApproved(Boolean approved) { this.isApproved = approved; }
}
