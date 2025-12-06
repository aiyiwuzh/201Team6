package com.team6.backend.repository;

import com.team6.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {
    
    /**
     * Find all matches where user is either user1 or user2
     */
    @Query("SELECT m FROM Match m WHERE m.user1Id = :userId OR m.user2Id = :userId")
    List<Match> findByUserId(@Param("userId") UUID userId);
    
    /**
     * Find active matches for a user
     */
    @Query("SELECT m FROM Match m WHERE (m.user1Id = :userId OR m.user2Id = :userId) AND m.isActive = true")
    List<Match> findActiveMatchesByUserId(@Param("userId") UUID userId);
}

