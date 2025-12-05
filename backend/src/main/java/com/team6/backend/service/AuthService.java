package com.team6.backend.service;
import com.team6.backend.model.User;
import com.team6.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // Simple in-memory session token storage
    private Map<String, Long> sessions = new HashMap<>();

    public User register(String email, String passwordHash) {
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email already exists.");
        }

        User user = new User(email, passwordHash);
        return userRepository.save(user);
    }

    public String login(String email, String passwordHash) {
        User user = userRepository.findByEmail(email);

        if (user == null || !user.getPasswordHash().equals(passwordHash)) {
            throw new RuntimeException("Invalid login credentials.");
        }

        // Create a session token
        String token = UUID.randomUUID().toString();
        sessions.put(token, user.getId());

        return token;
    }

    public Long getUserIdFromToken(String token) {
        return sessions.get(token);
    }
}
