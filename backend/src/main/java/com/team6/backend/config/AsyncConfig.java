package com.team6.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration for asynchronous processing and multithreading
 * Enables @Async annotation and configures custom thread pools
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    
    /**
     * Thread pool for match score calculations
     * Demonstrates multithreading with custom thread pool configuration
     * 
     * Thread Pool Properties:
     * - Core Pool Size: 5 threads always running
     * - Max Pool Size: 10 threads maximum
     * - Queue Capacity: 25 tasks can be queued
     * - Thread Name Prefix: "MatchScore-" for easy identification
     */
    @Bean(name = "matchScoreExecutor")
    public Executor matchScoreExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Core threads that are always alive
        executor.setCorePoolSize(5);
        
        // Maximum number of threads
        executor.setMaxPoolSize(10);
        
        // Queue capacity for pending tasks
        executor.setQueueCapacity(25);
        
        // Thread naming for debugging
        executor.setThreadNamePrefix("MatchScore-");
        
        // Graceful shutdown settings
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        // Initialize the executor
        executor.initialize();
        
        return executor;
    }
}

