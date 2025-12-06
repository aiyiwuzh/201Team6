package com.team6.backend.repository;

import com.team6.backend.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    
    /**
     * Find a profile by user_id
     */
    Optional<Profile> findByUserId(UUID userId);
    
    /**
     * Find all profiles except the one with the specified user_id
     */
    List<Profile> findByUserIdNot(UUID excludeUserId);
}

