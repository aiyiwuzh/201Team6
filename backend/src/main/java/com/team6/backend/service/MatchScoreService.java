package com.team6.backend.service;

import com.team6.backend.model.Profile;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

/**
 * Service for calculating compatibility scores between two profiles
 * Uses multiple data structures for sophisticated matching algorithm
 * Now includes MULTITHREADING support for parallel calculations
 */
@Service
public class MatchScoreService {
    
    // Data Structure 1: HashMap for category weights
    private static final Map<String, Double> CATEGORY_WEIGHTS = new HashMap<>() {{
        put("budget", 0.30);           // 30% - Financial compatibility
        put("lifestyle", 0.25);        // 25% - Lifestyle traits
        put("academic", 0.20);         // 20% - Academic alignment
        put("preferences", 0.15);      // 15% - General preferences
        put("cleanliness", 0.10);      // 10% - Cleanliness compatibility
    }};
    
    // Data Structure 5: TreeMap for sorted compatibility rating thresholds
    // TreeMap maintains natural ordering of keys (score thresholds)
    private static final TreeMap<Integer, String> COMPATIBILITY_RATINGS = new TreeMap<>() {{
        put(0, "Very Low");      // 0-29%
        put(30, "Low");          // 30-49%
        put(50, "Moderate");     // 50-69%
        put(70, "High");         // 70-84%
        put(85, "Very High");    // 85-94%
        put(95, "Excellent");    // 95-100%
    }};
    
    /**
     * Get compatibility rating label based on score
     * Uses TreeMap.floorEntry() to find the appropriate rating
     * TreeMap's floorEntry() returns the greatest key less than or equal to the given key
     */
    public String getCompatibilityRating(int score) {
        Map.Entry<Integer, String> entry = COMPATIBILITY_RATINGS.floorEntry(score);
        return entry != null ? entry.getValue() : "Unknown";
    }
    
    /**
     * Calculate match percentage between two profiles
     * Returns score from 0-100
     */
    public int calculateMatchScore(Profile profile1, Profile profile2) {
        if (profile1 == null || profile2 == null) {
            return 0;
        }
        
        // Data Structure 2: List to store individual compatibility factors
        List<CompatibilityFactor> factors = new ArrayList<>();
        
        // Calculate scores for each category
        factors.add(new CompatibilityFactor("budget", calculateBudgetScore(profile1, profile2), CATEGORY_WEIGHTS.get("budget")));
        factors.add(new CompatibilityFactor("lifestyle", calculateLifestyleScore(profile1, profile2), CATEGORY_WEIGHTS.get("lifestyle")));
        factors.add(new CompatibilityFactor("academic", calculateAcademicScore(profile1, profile2), CATEGORY_WEIGHTS.get("academic")));
        factors.add(new CompatibilityFactor("preferences", calculatePreferencesScore(profile1, profile2), CATEGORY_WEIGHTS.get("preferences")));
        factors.add(new CompatibilityFactor("cleanliness", calculateCleanlinessScore(profile1, profile2), CATEGORY_WEIGHTS.get("cleanliness")));
        
        // Data Structure 3: PriorityQueue to rank factors by importance
        PriorityQueue<CompatibilityFactor> rankedFactors = new PriorityQueue<>(
            (f1, f2) -> Double.compare(f2.weightedScore(), f1.weightedScore())
        );
        rankedFactors.addAll(factors);
        
        // Calculate weighted total using priority queue
        double totalScore = 0.0;
        while (!rankedFactors.isEmpty()) {
            CompatibilityFactor factor = rankedFactors.poll();
            totalScore += factor.weightedScore();
        }
        
        // Data Structure 4: Set for analyzing shared characteristics
        Set<String> sharedTraits = analyzeSharedTraits(profile1, profile2);
        
        // Bonus points for shared traits (up to 10%)
        double sharedTraitsBonus = Math.min(10.0, sharedTraits.size() * 2.0);
        totalScore += sharedTraitsBonus;
        
        // Cap at 100 and round
        return (int) Math.min(100, Math.round(totalScore));
    }
    
    /**
     * MULTITHREADING VERSION: Calculate match score using parallel processing
     * Uses CompletableFuture to calculate all 5 category scores CONCURRENTLY
     * 
     * Demonstrates:
     * - @Async annotation for async execution
     * - CompletableFuture for parallel tasks
     * - Custom thread pool (matchScoreExecutor)
     * - Non-blocking computation
     * 
     * @param profile1 First profile to compare
     * @param profile2 Second profile to compare
     * @return CompletableFuture that will contain the final score (0-100)
     */
    @Async("matchScoreExecutor")
    public CompletableFuture<Integer> calculateMatchScoreAsync(Profile profile1, Profile profile2) {
        long startTime = System.currentTimeMillis();
        System.out.println("[" + Thread.currentThread().getName() + "] Starting ASYNC match score calculation");
        
        if (profile1 == null || profile2 == null) {
            return CompletableFuture.completedFuture(0);
        }
        
        try {
            // PARALLEL EXECUTION: Launch all 5 calculations in separate threads
            CompletableFuture<Double> budgetFuture = CompletableFuture.supplyAsync(() -> {
                System.out.println("[" + Thread.currentThread().getName() + "] Calculating budget score");
                return calculateBudgetScore(profile1, profile2);
            });
            
            CompletableFuture<Double> lifestyleFuture = CompletableFuture.supplyAsync(() -> {
                System.out.println("[" + Thread.currentThread().getName() + "] Calculating lifestyle score");
                return calculateLifestyleScore(profile1, profile2);
            });
            
            CompletableFuture<Double> academicFuture = CompletableFuture.supplyAsync(() -> {
                System.out.println("[" + Thread.currentThread().getName() + "] Calculating academic score");
                return calculateAcademicScore(profile1, profile2);
            });
            
            CompletableFuture<Double> preferencesFuture = CompletableFuture.supplyAsync(() -> {
                System.out.println("[" + Thread.currentThread().getName() + "] Calculating preferences score");
                return calculatePreferencesScore(profile1, profile2);
            });
            
            CompletableFuture<Double> cleanlinessFuture = CompletableFuture.supplyAsync(() -> {
                System.out.println("[" + Thread.currentThread().getName() + "] Calculating cleanliness score");
                return calculateCleanlinessScore(profile1, profile2);
            });
            
            // Wait for ALL parallel tasks to complete
            CompletableFuture<Void> allFutures = CompletableFuture.allOf(
                budgetFuture, lifestyleFuture, academicFuture, preferencesFuture, cleanlinessFuture
            );
            
            // When all complete, combine results
            return allFutures.thenApply(v -> {
                try {
                    System.out.println("[" + Thread.currentThread().getName() + "] All parallel calculations complete, combining results...");
                    
                    // Data Structure 2: List to store compatibility factors
                    List<CompatibilityFactor> factors = new ArrayList<>();
                    factors.add(new CompatibilityFactor("budget", budgetFuture.get(), CATEGORY_WEIGHTS.get("budget")));
                    factors.add(new CompatibilityFactor("lifestyle", lifestyleFuture.get(), CATEGORY_WEIGHTS.get("lifestyle")));
                    factors.add(new CompatibilityFactor("academic", academicFuture.get(), CATEGORY_WEIGHTS.get("academic")));
                    factors.add(new CompatibilityFactor("preferences", preferencesFuture.get(), CATEGORY_WEIGHTS.get("preferences")));
                    factors.add(new CompatibilityFactor("cleanliness", cleanlinessFuture.get(), CATEGORY_WEIGHTS.get("cleanliness")));
                    
                    // Data Structure 3: PriorityQueue to rank factors
                    PriorityQueue<CompatibilityFactor> rankedFactors = new PriorityQueue<>(
                        (f1, f2) -> Double.compare(f2.weightedScore(), f1.weightedScore())
                    );
                    rankedFactors.addAll(factors);
                    
                    // Calculate weighted total
                    double totalScore = 0.0;
                    while (!rankedFactors.isEmpty()) {
                        CompatibilityFactor factor = rankedFactors.poll();
                        totalScore += factor.weightedScore();
                    }
                    
                    // Data Structure 4: Set for shared traits
                    Set<String> sharedTraits = analyzeSharedTraits(profile1, profile2);
                    double sharedTraitsBonus = Math.min(10.0, sharedTraits.size() * 2.0);
                    totalScore += sharedTraitsBonus;
                    
                    int finalScore = (int) Math.min(100, Math.round(totalScore));
                    long duration = System.currentTimeMillis() - startTime;
                    
                    System.out.println("[" + Thread.currentThread().getName() + "] ASYNC calculation completed: " + 
                                     finalScore + "% (took " + duration + "ms)");
                    
                    return finalScore;
                    
                } catch (InterruptedException | ExecutionException e) {
                    System.err.println("Error in parallel score calculation: " + e.getMessage());
                    return 50; // Return neutral score on error
                }
            });
            
        } catch (Exception e) {
            System.err.println("Error in async match score calculation: " + e.getMessage());
            return CompletableFuture.completedFuture(50);
        }
    }
    
    /**
     * Calculate budget compatibility score (0-100)
     */
    private double calculateBudgetScore(Profile p1, Profile p2) {
        BigDecimal p1Min = p1.getBudgetMin();
        BigDecimal p1Max = p1.getBudgetMax();
        BigDecimal p2Min = p2.getBudgetMin();
        BigDecimal p2Max = p2.getBudgetMax();
        
        // If either doesn't have budget set, return neutral score
        if (p1Min == null || p1Max == null || p2Min == null || p2Max == null) {
            return 50.0;
        }
        
        // Calculate overlap between budget ranges
        BigDecimal overlapStart = p1Min.max(p2Min);
        BigDecimal overlapEnd = p1Max.min(p2Max);
        
        if (overlapStart.compareTo(overlapEnd) > 0) {
            // No overlap at all
            double gap = overlapStart.subtract(overlapEnd).doubleValue();
            // Penalize based on gap size (max penalty at $500 gap)
            return Math.max(0, 100.0 - (gap / 5.0));
        }
        
        // Calculate overlap percentage relative to average range size
        BigDecimal overlap = overlapEnd.subtract(overlapStart);
        BigDecimal p1Range = p1Max.subtract(p1Min);
        BigDecimal p2Range = p2Max.subtract(p2Min);
        BigDecimal avgRange = p1Range.add(p2Range).divide(BigDecimal.valueOf(2));
        
        double overlapPercentage = overlap.divide(avgRange, 4, BigDecimal.ROUND_HALF_UP).doubleValue();
        return Math.min(100.0, overlapPercentage * 100.0);
    }
    
    /**
     * Calculate lifestyle compatibility based on year and school
     */
    private double calculateLifestyleScore(Profile p1, Profile p2) {
        double score = 0.0;
        int factors = 0;
        
        // Year compatibility (same year = higher score)
        if (p1.getYear() != null && p2.getYear() != null && !p1.getYear().isEmpty() && !p2.getYear().isEmpty()) {
            if (p1.getYear().equals(p2.getYear())) {
                score += 100.0;
            } else {
                // Adjacent years get partial credit
                Map<String, Integer> yearRanking = new HashMap<>() {{
                    put("freshman", 1);
                    put("sophomore", 2);
                    put("junior", 3);
                    put("senior", 4);
                    put("graduate", 5);
                }};
                
                Integer rank1 = yearRanking.getOrDefault(p1.getYear(), 3);
                Integer rank2 = yearRanking.getOrDefault(p2.getYear(), 3);
                int difference = Math.abs(rank1 - rank2);
                
                // 1 year apart = 70%, 2 years = 40%, 3+ years = 20%
                score += Math.max(20.0, 100.0 - (difference * 30.0));
            }
            factors++;
        }
        
        // School compatibility
        if (p1.getSchool() != null && p2.getSchool() != null && !p1.getSchool().isEmpty() && !p2.getSchool().isEmpty()) {
            if (p1.getSchool().equals(p2.getSchool())) {
                score += 100.0;
            } else {
                score += 60.0; // Different schools but still on campus
            }
            factors++;
        }
        
        return factors > 0 ? score / factors : 50.0;
    }
    
    /**
     * Calculate academic compatibility based on major
     */
    private double calculateAcademicScore(Profile p1, Profile p2) {
        if (p1.getMajor() == null || p2.getMajor() == null || 
            p1.getMajor().isEmpty() || p2.getMajor().isEmpty()) {
            return 50.0;
        }
        
        // Exact same major
        if (p1.getMajor().equalsIgnoreCase(p2.getMajor())) {
            return 100.0;
        }
        
        // Use HashMap to group related majors
        Map<String, Set<String>> majorGroups = new HashMap<>() {{
            put("engineering", new HashSet<>(Arrays.asList("computer science", "electrical engineering", 
                "mechanical engineering", "civil engineering", "aerospace engineering", "cs")));
            put("business", new HashSet<>(Arrays.asList("business", "economics", "finance", "accounting", "marketing")));
            put("arts", new HashSet<>(Arrays.asList("art", "music", "theatre", "design", "film")));
            put("science", new HashSet<>(Arrays.asList("biology", "chemistry", "physics", "mathematics", "math")));
            put("humanities", new HashSet<>(Arrays.asList("english", "history", "philosophy", "psychology", "sociology")));
        }};
        
        // Check if majors are in same group
        String major1Lower = p1.getMajor().toLowerCase();
        String major2Lower = p2.getMajor().toLowerCase();
        
        for (Set<String> group : majorGroups.values()) {
            boolean contains1 = group.stream().anyMatch(major1Lower::contains);
            boolean contains2 = group.stream().anyMatch(major2Lower::contains);
            
            if (contains1 && contains2) {
                return 75.0; // Related majors
            }
        }
        
        // Unrelated majors - can still be compatible
        return 50.0;
    }
    
    /**
     * Calculate preferences score based on various factors
     */
    private double calculatePreferencesScore(Profile p1, Profile p2) {
        // Age proximity
        if (p1.getAge() != null && p2.getAge() != null) {
            int ageDiff = Math.abs(p1.getAge() - p2.getAge());
            // Same age = 100, 1 year = 90, 2 years = 80, etc.
            return Math.max(40.0, 100.0 - (ageDiff * 10.0));
        }
        
        return 50.0;
    }
    
    /**
     * Calculate cleanliness compatibility score
     */
    private double calculateCleanlinessScore(Profile p1, Profile p2) {
        if (p1.getCleanlinessRating() == null || p2.getCleanlinessRating() == null) {
            return 50.0;
        }
        
        // Cleanliness ratings on 1-10 scale
        int diff = Math.abs(p1.getCleanlinessRating() - p2.getCleanlinessRating());
        
        // Perfect match (0 diff) = 100%
        // 1 point diff = 90%
        // 2 points diff = 75%
        // 3+ points diff = decreasing
        if (diff == 0) return 100.0;
        if (diff == 1) return 90.0;
        if (diff == 2) return 75.0;
        
        return Math.max(30.0, 100.0 - (diff * 15.0));
    }
    
    /**
     * Analyze shared traits between profiles using Set operations
     * Returns Set of shared characteristics
     */
    private Set<String> analyzeSharedTraits(Profile p1, Profile p2) {
        // Data Structure 4: Set for efficient trait comparison
        Set<String> sharedTraits = new HashSet<>();
        
        // Compare majors
        if (p1.getMajor() != null && p2.getMajor() != null && 
            p1.getMajor().equalsIgnoreCase(p2.getMajor())) {
            sharedTraits.add("same_major");
        }
        
        // Compare schools
        if (p1.getSchool() != null && p2.getSchool() != null && 
            p1.getSchool().equalsIgnoreCase(p2.getSchool())) {
            sharedTraits.add("same_school");
        }
        
        // Compare years
        if (p1.getYear() != null && p2.getYear() != null && 
            p1.getYear().equals(p2.getYear())) {
            sharedTraits.add("same_year");
        }
        
        // Similar cleanliness (within 2 points)
        if (p1.getCleanlinessRating() != null && p2.getCleanlinessRating() != null) {
            if (Math.abs(p1.getCleanlinessRating() - p2.getCleanlinessRating()) <= 2) {
                sharedTraits.add("similar_cleanliness");
            }
        }
        
        // Overlapping budget
        if (p1.getBudgetMin() != null && p1.getBudgetMax() != null && 
            p2.getBudgetMin() != null && p2.getBudgetMax() != null) {
            BigDecimal overlapStart = p1.getBudgetMin().max(p2.getBudgetMin());
            BigDecimal overlapEnd = p1.getBudgetMax().min(p2.getBudgetMax());
            if (overlapStart.compareTo(overlapEnd) <= 0) {
                sharedTraits.add("budget_overlap");
            }
        }
        
        return sharedTraits;
    }
    
    /**
     * Get detailed breakdown of match score
     */
    public Map<String, Object> getMatchScoreBreakdown(Profile profile1, Profile profile2) {
        Map<String, Object> breakdown = new HashMap<>();
        
        // Calculate individual category scores
        double budgetScore = calculateBudgetScore(profile1, profile2);
        double lifestyleScore = calculateLifestyleScore(profile1, profile2);
        double academicScore = calculateAcademicScore(profile1, profile2);
        double preferencesScore = calculatePreferencesScore(profile1, profile2);
        double cleanlinessScore = calculateCleanlinessScore(profile1, profile2);
        
        // Get shared traits
        Set<String> sharedTraits = analyzeSharedTraits(profile1, profile2);
        
        // Build breakdown map
        Map<String, Double> categoryScores = new HashMap<>();
        categoryScores.put("budget", budgetScore);
        categoryScores.put("lifestyle", lifestyleScore);
        categoryScores.put("academic", academicScore);
        categoryScores.put("preferences", preferencesScore);
        categoryScores.put("cleanliness", cleanlinessScore);
        
        int overallScore = calculateMatchScore(profile1, profile2);
        breakdown.put("overall_score", overallScore);
        breakdown.put("compatibility_rating", getCompatibilityRating(overallScore));
        breakdown.put("category_scores", categoryScores);
        breakdown.put("shared_traits", sharedTraits);
        breakdown.put("shared_traits_count", sharedTraits.size());
        
        // Create compatibility list using priority queue
        PriorityQueue<CompatibilityFactor> rankedFactors = new PriorityQueue<>(
            (f1, f2) -> Double.compare(f2.score, f1.score)
        );
        
        rankedFactors.add(new CompatibilityFactor("Budget Compatibility", budgetScore, CATEGORY_WEIGHTS.get("budget")));
        rankedFactors.add(new CompatibilityFactor("Lifestyle Alignment", lifestyleScore, CATEGORY_WEIGHTS.get("lifestyle")));
        rankedFactors.add(new CompatibilityFactor("Academic Similarity", academicScore, CATEGORY_WEIGHTS.get("academic")));
        rankedFactors.add(new CompatibilityFactor("Preference Match", preferencesScore, CATEGORY_WEIGHTS.get("preferences")));
        rankedFactors.add(new CompatibilityFactor("Cleanliness Sync", cleanlinessScore, CATEGORY_WEIGHTS.get("cleanliness")));
        
        // Extract top factors
        List<Map<String, Object>> topFactors = new ArrayList<>();
        while (!rankedFactors.isEmpty()) {
            CompatibilityFactor factor = rankedFactors.poll();
            Map<String, Object> factorMap = new HashMap<>();
            factorMap.put("category", factor.category);
            factorMap.put("score", factor.score);
            factorMap.put("weight", factor.weight);
            factorMap.put("weighted_score", factor.weightedScore());
            topFactors.add(factorMap);
        }
        
        breakdown.put("ranked_factors", topFactors);
        
        return breakdown;
    }
    
    /**
     * Inner class to represent a compatibility factor
     * Used in List and PriorityQueue data structures
     */
    private static class CompatibilityFactor {
        String category;
        double score;      // 0-100
        double weight;     // 0-1
        
        CompatibilityFactor(String category, double score, double weight) {
            this.category = category;
            this.score = score;
            this.weight = weight;
        }
        
        double weightedScore() {
            return (score / 100.0) * weight * 100.0;
        }
    }
}

