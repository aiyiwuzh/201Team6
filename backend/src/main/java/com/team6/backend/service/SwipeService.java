package com.team6.backend.service;

import com.team6.backend.model.Match;
import com.team6.backend.model.Swipe;
import com.team6.backend.model.User;
import com.team6.backend.repository.MatchRepository;
import com.team6.backend.repository.SwipeRepository;
import com.team6.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class SwipeService {
    
    private final SwipeRepository swipeRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    public SwipeService(SwipeRepository swipeRepository,
                       MatchRepository matchRepository,
                       UserRepository userRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.swipeRepository = swipeRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    	}
    /**
     * Process a swipe (right or left)
     * Returns true if it's a match, false otherwise
     */
    @Transactional
    public boolean processSwipe(Long swiperId, Long swipedId, boolean isApproved) {
        // 1. Check if swiping on self
        if (swiperId.equals(swipedId)) {
            throw new IllegalArgumentException("Cannot swipe on yourself");
        }
        
        // 2. Check if already swiped
        Optional<Swipe> existingSwipe = swipeRepository.findBySwiperAndSwiped(swiperId, swipedId);
        if (existingSwipe.isPresent()) {
            return false; // Already swiped, no action
        }
        
        // 3. Save the swipe
        Swipe swipe = new Swipe(swiperId, swipedId, isApproved);
        swipeRepository.save(swipe);
        
        // 4. If it's a right swipe, check for mutual swipe
        if (isApproved) {
            Optional<Swipe> reciprocalSwipe = swipeRepository.findBySwiperAndSwiped(swipedId, swiperId);
            if (reciprocalSwipe.isPresent() && reciprocalSwipe.get().getIsApproved()) {
                // IT'S A MATCH!
                createMatch(swiperId, swipedId);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Create a match between two users
     */
    private void createMatch(Long user1Id, Long user2Id) {
        // Check if match already exists
        if (!matchRepository.existsMatchBetween(user1Id, user2Id)) {
            Match match = new Match(user1Id, user2Id);
            matchRepository.save(match);
            
            // Send WebSocket notifications to both users
            notifyMatch(user1Id, user2Id, match.getId());
        }
    }
    
    /**
     * Notify both users about the match via WebSocket
     */
    private void notifyMatch(Long user1Id, Long user2Id, Long matchId) {
        // Create match notification object
        Map<String, Object> matchNotification = new HashMap<>();
        matchNotification.put("type", "NEW_MATCH");
        matchNotification.put("matchId", matchId);
        matchNotification.put("user1Id", user1Id);
        matchNotification.put("user2Id", user2Id);
        matchNotification.put("timestamp", System.currentTimeMillis());
        
        // Send to both users
        messagingTemplate.convertAndSend("/topic/user/" + user1Id + "/matches", matchNotification);
        messagingTemplate.convertAndSend("/topic/user/" + user2Id + "/matches", matchNotification);
    }
    
    /**
     * Get next candidate for swiping
     * Implements basic algorithm: Users you haven't swiped on yet
     */
    public Optional<User> getNextCandidate(Long userId) {
        // Get IDs of users already swiped on
        List<Long> swipedUserIds = swipeRepository.findSwipedUserIdsBySwiper(userId);
        
        // Add self to avoid showing own profile
        swipedUserIds.add(userId);
        
        // Get a user not in the swiped list
        // TODO: Implement more sophisticated matching algorithm (Gale-Shapley)
        List<User> potentialCandidates = userRepository.findUsersNotInList(swipedUserIds);
        
        if (!potentialCandidates.isEmpty()) {
            // Simple random selection for now
            Random random = new Random();
            return Optional.of(potentialCandidates.get(random.nextInt(potentialCandidates.size())));
        }
        
        return Optional.empty();
    }
    
    /**
     * Get all matches for a user
     */
    public List<Match> getUserMatches(Long userId) {
        return matchRepository.findMatchesByUserId(userId);
    }
}