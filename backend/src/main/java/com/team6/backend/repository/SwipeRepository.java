package com.team6.backend.repository;

import com.team6.backend.model.Swipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SwipeRepository extends JpaRepository<Swipe, UUID> {
    
    /**
     * Find all swipes by a specific swiper
     */
    List<Swipe> findBySwiperId(UUID swiperId);
    
    /**
     * Find a swipe between two specific users
     */
    Optional<Swipe> findBySwiperIdAndSwipedId(UUID swiperId, UUID swipedId);
    
    /**
     * Find a swipe by swiped user and swiper with specific action
     * Used to check if reverse swipe exists for match detection
     */
    Optional<Swipe> findBySwipedIdAndSwiperIdAndAction(UUID swipedId, UUID swiperId, String action);
}

