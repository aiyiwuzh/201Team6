package com.team6.backend.model;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long matchId;
    private Long senderId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Instant timestamp = Instant.now();

    public Message() {}

    public Message(Long matchId, Long senderId, String content) {
        this.matchId = matchId;
        this.senderId = senderId;
        this.content = content;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public Long getMatchId() { return matchId; }
    public Long getSenderId() { return senderId; }
    public String getContent() { return content; }
    public Instant getTimestamp() { return timestamp; }

    public void setContent(String content) { this.content = content; }
}
