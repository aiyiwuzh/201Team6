package com.team6.backend.model;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "swipes")
public class Swipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long swiperUserId;
    private Long swipedUserId;

    private Boolean approved;  // true = right swipe

    private Instant timestamp = Instant.now();

    public Swipe() {}

    public Swipe(Long swiperUserId, Long swipedUserId, Boolean approved) {
        this.swiperUserId = swiperUserId;
        this.swipedUserId = swipedUserId;
        this.approved = approved;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public Long getSwiperUserId() { return swiperUserId; }
    public Long getSwipedUserId() { return swipedUserId; }
    public Boolean getApproved() { return approved; }
    public Instant getTimestamp() { return timestamp; }

    public void setSwiperUserId(Long swiperUserId) { this.swiperUserId = swiperUserId; }
    public void setSwipedUserId(Long swipedUserId) { this.swipedUserId = swipedUserId; }
    public void setApproved(Boolean approved) { this.approved = approved; }
}
