package com.team6.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(columnDefinition = "TEXT")
    private String profileJson;   // optional profile data

    public User() {}

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
    }

    // Getters & Setters…
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getProfileJson() { return profileJson; }

    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setProfileJson(String profileJson) { this.profileJson = profileJson; }
}
