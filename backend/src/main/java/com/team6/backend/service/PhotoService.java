package com.team6.backend.service;

import com.team6.backend.model.Profile;
import com.team6.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;    
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
public class PhotoService {

    @Value("${supabase.storage.url}")
    private String storageUrl;

    @Value("${supabase.storage.bucket}")
    private String bucket;

    @Value("${supabase.service_role}")
    private String serviceRoleKey;

    @Autowired
    private ProfileRepository profileRepository;

    public Profile uploadUserPhoto(UUID userId, MultipartFile file) throws Exception {

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        String fileName = userId + "-" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        String uploadUrl = storageUrl + "/object/" + bucket + "/" + fileName;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer " + serviceRoleKey)
                .header("apikey", serviceRoleKey)
                .header("Content-Type", file.getContentType())
                .PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 300) {
            throw new RuntimeException("Supabase upload failed: " + response.body());
        }

        // Public URL
        String publicUrl =
                storageUrl.replace("/storage/v1", "") +
                "/storage/v1/object/public/" + bucket + "/" + fileName;

        profile.setPhotoUrl(publicUrl);
        profileRepository.save(profile);

        return profile;
    }
}
