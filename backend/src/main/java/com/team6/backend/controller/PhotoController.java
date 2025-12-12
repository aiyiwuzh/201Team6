package com.team6.backend.controller;

import com.team6.backend.model.Profile;

import com.team6.backend.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;


@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "http://localhost:5173")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @PostMapping("/upload/{userId}")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable UUID userId,
            @RequestParam("file") MultipartFile file) {

        try {
            Profile updated = photoService.uploadUserPhoto(userId, file);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
