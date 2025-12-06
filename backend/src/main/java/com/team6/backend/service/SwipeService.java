package com.team6.backend.service;

import com.team6.backend.model.Match;
import com.team6.backend.model.Swipe;
import com.team6.backend.repository.MatchRepository;
import com.team6.backend.repository.SwipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SwipeService {
    
    @Autowired
    private SwipeRepository swipeRepository;
    
    @Autowired
    private MatchRepository matchRepository;
    
    /**
     * Create a swipe and automatically check for match
     * Returns map with swipe data and optional match
     */
    public Map<String, Object> createSwipe(UUID swiperId, UUID swipedId, String action) {
        // Validation
        if (swiperId == null || swipedId == null) {
            throw new IllegalArgumentException("Swiper ID and Swiped ID cannot be null");
        }
        
        if (swiperId.equals(swipedId)) {
            throw new IllegalArgumentException("Cannot swipe on yourself");
        }
        
        if (!action.equals("approve") && !action.equals("decline")) {
            throw new IllegalArgumentException("Action must be 'approve' or 'decline'");
        }
        
        // Check if swipe already exists
        Optional<Swipe> existingSwipe = swipeRepository.findBySwiperIdAndSwipedId(swiperId, swipedId);
        if (existingSwipe.isPresent()) {
            throw new IllegalArgumentException("You have already swiped on this user");
        }
        
        // Create swipe
        Swipe swipe = new Swipe();
        swipe.setSwiperId(swiperId);
        swipe.setSwipedId(swipedId);
        swipe.setAction(action);
        swipe.setIsApproved(action.equals("approve"));
        swipe.setCreatedAt(LocalDateTime.now());
        swipe.setTimestamp(LocalDateTime.now());
        
        Swipe savedSwipe = swipeRepository.save(swipe);
        
        // Check for match if this was an approval
        Match match = null;
        if (action.equals("approve")) {
            match = checkForMatch(swiperId, swipedId);
        }
        
        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("swipe", savedSwipe);
        response.put("match", match);
        
        return response;
    }
    
    /**
     * Check if there's a mutual match between two users
     * If yes, create a match record
     */
    private Match checkForMatch(UUID swiperId, UUID swipedId) {
        // Check if the other user has also approved this user
        Optional<Swipe> reverseSwipe = swipeRepository.findBySwipedIdAndSwiperIdAndAction(
            swiperId, // Now looking for swipes where current swiper was swiped on
            swipedId, // By the user they just swiped on
            "approve"
        );
        
        if (reverseSwipe.isPresent()) {
            // Check if match already exists (in either direction)
            List<Match> existingMatches = matchRepository.findByUserId(swiperId);
            for (Match existing : existingMatches) {
                if ((existing.getUser1Id().equals(swiperId) && existing.getUser2Id().equals(swipedId)) ||
                    (existing.getUser1Id().equals(swipedId) && existing.getUser2Id().equals(swiperId))) {
                    // Match already exists, return it
                    return existing;
                }
            }
            
            // Mutual approval and no existing match! Create a new match
            return createMatch(swiperId, swipedId);
        }
        
        return null;
    }
    
    /**
     * Create a match record between two users
     */
    private Match createMatch(UUID user1Id, UUID user2Id) {
        Match match = new Match();
        match.setUser1Id(user1Id);
        match.setUser2Id(user2Id);
        match.setIsActive(true);
        match.setCreatedAt(LocalDateTime.now());
        match.setMatchedAt(LocalDateTime.now());
        
        return matchRepository.save(match);
    }
    
    /**
     * Get all swipes made by a user
     */
    public List<Swipe> getUserSwipes(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return swipeRepository.findBySwiperId(userId);
    }
    
    /**
     * Check if a swipe exists between two users
     */
    public Optional<Swipe> getSwipe(UUID swiperId, UUID swipedId) {
        if (swiperId == null || swipedId == null) {
            throw new IllegalArgumentException("Swiper ID and Swiped ID cannot be null");
        }
        return swipeRepository.findBySwiperIdAndSwipedId(swiperId, swipedId);
    }
}

