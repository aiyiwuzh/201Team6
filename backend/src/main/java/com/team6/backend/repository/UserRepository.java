package com.team6.backend.repository;

import com.team6.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    User findByEmail(String email);
    
    // Add this method for finding users not in a list
    @Query("SELECT u FROM User u WHERE u.id NOT IN :userIds")
    List<User> findUsersNotInList(@Param("userIds") List<Long> userIds);
}
