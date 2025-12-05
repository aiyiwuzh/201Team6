package com.team6.backend.repository;

import com.team6.backend.model.Swipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SwipeRepository extends JpaRepository<Swipe, Long> {
    
    // Check if a swipe exists between two users
    @Query("SELECT s FROM Swipe s WHERE s.swiperUserId = :swiperId AND s.swipedUserId = :swipedId")
    Optional<Swipe> findBySwiperAndSwiped(@Param("swiperId") Long swiperId, 
                                          @Param("swipedId") Long swipedId);
    
    // Get all users that a user has swiped on
    @Query("SELECT s.swipedUserId FROM Swipe s WHERE s.swiperUserId = :userId")
    List<Long> findSwipedUserIdsBySwiper(@Param("userId") Long userId);
    
    // Get all users who have swiped on a user
    @Query("SELECT s.swiperUserId FROM Swipe s WHERE s.swipedUserId = :userId AND s.isApproved = true")
    List<Long> findLikedByUserIds(@Param("userId") Long userId);
    
    // Get mutual swipes (matches that haven't been created yet)
    @Query("SELECT s FROM Swipe s WHERE s.swiperUserId = :user1 AND s.swipedUserId = :user2 AND s.isApproved = true")
    Optional<Swipe> findMutualSwipe(@Param("user1") Long user1, 
                                    @Param("user2") Long user2);
}