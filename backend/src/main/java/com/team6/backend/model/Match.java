package com.team6.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
public class Match {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user1_id")
    private Long user1Id;
    
    @Column(name = "user2_id")
    private Long user2Id;
    
    @Column(name = "matched_at")
    private LocalDateTime matchedAt;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    public Match() {
        this.matchedAt = LocalDateTime.now();
    }
    
    public Match(Long user1Id, Long user2Id) {
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.matchedAt = LocalDateTime.now();
        this.isActive = true;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getUser1Id() {
		return user1Id;
	}

	public void setUser1Id(Long user1Id) {
		this.user1Id = user1Id;
	}

	public Long getUser2Id() {
		return user2Id;
	}

	public void setUser2Id(Long user2Id) {
		this.user2Id = user2Id;
	}

	public LocalDateTime getMatchedAt() {
		return matchedAt;
	}

	public void setMatchedAt(LocalDateTime matchedAt) {
		this.matchedAt = matchedAt;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}
    
    // Getters and Setters
    // ...
}