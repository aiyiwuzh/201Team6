package com.team6.backend.repository;

import com.team6.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Get messages for a specific match, ordered by timestamp
    @Query("SELECT m FROM Message m WHERE m.matchId = :matchId ORDER BY m.timestamp ASC")
    List<Message> findMessagesByMatchId(@Param("matchId") Long matchId);
    
    // Get last N messages for a match
    @Query("SELECT m FROM Message m WHERE m.matchId = :matchId ORDER BY m.timestamp DESC LIMIT :limit")
    List<Message> findRecentMessages(@Param("matchId") Long matchId, 
                                     @Param("limit") int limit);
}