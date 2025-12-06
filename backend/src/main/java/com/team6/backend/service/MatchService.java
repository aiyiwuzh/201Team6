package com.team6.backend.service;

import com.team6.backend.model.Match;
import com.team6.backend.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MatchService {
    
    @Autowired
    private MatchRepository matchRepository;
    
    /**
     * Get all matches for a specific user
     * Returns matches where user is either user1 or user2
     */
    public List<Match> getUserMatches(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return matchRepository.findByUserId(userId);
    }
    
    /**
     * Get only active matches for a user
     */
    public List<Match> getActiveUserMatches(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return matchRepository.findActiveMatchesByUserId(userId);
    }
    
    /**
     * Delete a match by ID
     */
    public void deleteMatch(UUID matchId) {
        if (matchId == null) {
            throw new IllegalArgumentException("Match ID cannot be null");
        }
        
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with ID: " + matchId));
        
        matchRepository.delete(match);
    }
    
    /**
     * Deactivate a match instead of deleting
     */
    public Match deactivateMatch(UUID matchId) {
        if (matchId == null) {
            throw new IllegalArgumentException("Match ID cannot be null");
        }
        
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with ID: " + matchId));
        
        match.setIsActive(false);
        return matchRepository.save(match);
    }
}

