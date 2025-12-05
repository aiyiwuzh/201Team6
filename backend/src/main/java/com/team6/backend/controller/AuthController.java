package com.team6.backend.controller;
import com.team6.backend.model.User;
import com.team6.backend.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        return authService.register(email, password);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        String token = authService.login(email, password);

        return Map.of("token", token);
    }
}

