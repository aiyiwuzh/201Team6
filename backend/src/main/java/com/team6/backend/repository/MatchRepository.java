package com.team6.backend.repository;

import com.team6.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    
    // Find match between two users
    @Query("SELECT m FROM Match m WHERE (m.user1Id = :user1Id AND m.user2Id = :user2Id) OR (m.user1Id = :user2Id AND m.user2Id = :user1Id)")
    Optional<Match> findMatchBetweenUsers(@Param("user1Id") Long user1Id, 
                                          @Param("user2Id") Long user2Id);
    
    // Get all matches for a user
    @Query("SELECT m FROM Match m WHERE m.user1Id = :userId OR m.user2Id = :userId")
    List<Match> findMatchesByUserId(@Param("userId") Long userId);
    
    // Check if two users are matched
    @Query("SELECT COUNT(m) > 0 FROM Match m WHERE (m.user1Id = :user1Id AND m.user2Id = :user2Id) OR (m.user1Id = :user2Id AND m.user2Id = :user1Id)")
    boolean existsMatchBetween(@Param("user1Id") Long user1Id, 
                               @Param("user2Id") Long user2Id);
}