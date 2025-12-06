# TopTrait Backend Architecture

Complete overview of the Spring Boot backend architecture after migration.

## Overview

The TopTrait application now uses a **3-tier architecture** with a Spring Boot backend serving as an API layer between the React frontend and PostgreSQL database.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Frontend Layer (React + TypeScript)         │
│                    Port: 5173                            │
│                                                           │
│  Components → Services → API Client (Axios)             │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│            Backend Layer (Spring Boot + Java)            │
│                    Port: 8080                            │
│                                                           │
│  Controllers → Services → Repositories → JPA/Hibernate  │
└─────────────────────────────────────────────────────────┘
                          ↓ JDBC
┌─────────────────────────────────────────────────────────┐
│         Database Layer (PostgreSQL via Supabase)         │
│                                                           │
│  Tables: profiles, swipes, matches, messages            │
└─────────────────────────────────────────────────────────┘
```

## Backend Components

### Models (Entities)
Map Java objects to database tables using JPA annotations.

#### Profile.java
- Maps to: `profiles` table
- Fields: id, userId, email, fullName, age, major, school, year, bio, budgetMin, budgetMax, cleanlinessRating
- Special: Uses BigDecimal for budget fields (financial data)
- Annotations: @JsonProperty for snake_case JSON mapping

#### Swipe.java
- Maps to: `swipes` table
- Fields: id, swiperId, swipedId, action, isApproved, createdAt, timestamp
- Validation: action must be 'approve' or 'decline'

#### Match.java
- Maps to: `matches` table
- Fields: id, user1Id, user2Id, isActive, createdAt, matchedAt
- Default: isActive = true

### Repositories
Spring Data JPA interfaces for database operations.

#### ProfileRepository
```java
Optional<Profile> findByUserId(UUID userId);
List<Profile> findByUserIdNot(UUID excludeUserId);
```

#### SwipeRepository
```java
List<Swipe> findBySwiperId(UUID swiperId);
Optional<Swipe> findBySwiperIdAndSwipedId(UUID swiperId, UUID swipedId);
Optional<Swipe> findBySwipedIdAndSwiperIdAndAction(UUID swipedId, UUID swiperId, String action);
```

#### MatchRepository
```java
List<Match> findByUserId(UUID userId); // Custom @Query
List<Match> findActiveMatchesByUserId(UUID userId);
```

### Services (Business Logic)

#### ProfileService
- Create, read, update, delete profiles
- Validation: email format, user_id uniqueness
- Handles partial updates (only updates provided fields)

#### SwipeService
- Create swipe with validation
- **Automatic match detection** on mutual approval
- Duplicate prevention (swipes and matches)
- Get user swipe history
- Business rules:
  - Cannot swipe on yourself
  - Cannot swipe on same user twice
  - Must use valid action ('approve' or 'decline')

#### MatchService
- Get user matches (all or active only)
- Delete match (hard delete)
- Deactivate match (soft delete)

### Controllers (REST API)

#### ProfileController
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profiles` | Create profile |
| GET | `/api/profiles/user/{userId}` | Get profile by user_id |
| PUT | `/api/profiles/user/{userId}` | Update profile |
| GET | `/api/profiles?excludeUserId={id}` | Get all profiles |
| DELETE | `/api/profiles/user/{userId}` | Delete profile |

#### SwipeController
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/swipes` | Create swipe, auto-detect match |
| GET | `/api/swipes/user/{userId}` | Get user's swipes |
| GET | `/api/swipes/check?swiper={}&swiped={}` | Check if swipe exists |

#### MatchController
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches/user/{userId}` | Get all user matches |
| GET | `/api/matches/user/{userId}/active` | Get active matches only |
| DELETE | `/api/matches/{matchId}` | Delete match |
| PUT | `/api/matches/{matchId}/deactivate` | Deactivate match |

## Configuration

### Database Connection (`application.properties`)
```properties
# Supabase PostgreSQL (Session Pooler for IPv4)
spring.datasource.url=jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:6543/postgres?prepareThreshold=0
spring.datasource.username=postgres.pwbbdilghlmkvszoaxpe
spring.datasource.password=CSCI201MoJiang

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate  # Validate schema without modifying
spring.jpa.show-sql=true                # Log SQL queries
```

### CORS Configuration (`WebConfig.java`)
Allows requests from `http://localhost:5173` (Vite dev server)

## Data Flow Examples

### Example 1: Creating a Profile

```
User fills form → ProfilePage.tsx
    ↓ calls createProfile()
database.ts
    ↓ calls createProfileAPI()
api.ts (axios)
    ↓ POST /api/profiles
ProfileController
    ↓ calls profileService.createProfile()
ProfileService
    ↓ validates, saves via repository
ProfileRepository (JPA)
    ↓ INSERT query
PostgreSQL Database
```

### Example 2: Swiping with Match Detection

```
User swipes right → SwipingPage.tsx
    ↓ calls createSwipe()
database.ts
    ↓ calls createSwipeAPI()
api.ts (axios)
    ↓ POST /api/swipes {swiper_id, swiped_id, action: 'approve'}
SwipeController
    ↓ calls swipeService.createSwipe()
SwipeService
    ├─ Validates: not self, not duplicate
    ├─ Saves swipe to database
    ├─ Checks for reverse approval swipe
    ├─ If found: creates match automatically
    └─ Returns {swipe, match}
    ↓
Frontend receives response
    ↓
Shows match notification if match != null
```

## Key Design Patterns

### 1. Repository Pattern
- Abstracts database operations
- Spring Data JPA generates implementations

### 2. Service Layer Pattern
- Business logic separated from controllers
- Transactional operations
- Reusable methods

### 3. DTO Pattern (Implicit)
- JSON automatically serialized/deserialized
- @JsonProperty maps snake_case ↔ camelCase

### 4. Error Handling
- Try-catch in controllers
- Meaningful error messages
- Proper HTTP status codes

## Security Considerations

### Current Setup
- CORS restricted to localhost:5173
- No authentication layer (relies on Supabase Auth in frontend)
- user_id passed from frontend (trusted)

### Production Recommendations
1. Add JWT token validation in backend
2. Extract user_id from validated JWT (not from request body)
3. Add request rate limiting
4. Enable HTTPS
5. Add input sanitization
6. Implement proper error handling (don't expose stack traces)

## Performance Optimizations

### Implemented
- ✅ Connection pooling (HikariCP)
- ✅ Prepared statement caching disabled (for Supabase pooler)
- ✅ Transactional batch operations
- ✅ Indexed database queries

### Future Optimizations
- Add Redis caching layer
- Implement pagination for large result sets
- Add database query optimization
- Consider read replicas for scaling

## Technology Stack Summary

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **ORM**: Hibernate (via Spring Data JPA)
- **Connection Pooling**: HikariCP
- **Build Tool**: Maven 3.x
- **Server**: Embedded Tomcat

### Database
- **Type**: PostgreSQL 15+
- **Provider**: Supabase
- **Connection**: Session Pooler (port 6543, IPv4 compatible)
- **Schema**: 4 main tables (profiles, swipes, matches, messages)

### Frontend
- **Framework**: React 18 + TypeScript
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Project Structure

```
backend/
├── pom.xml
├── src/main/
│   ├── java/com/team6/backend/
│   │   ├── BackendApplication.java
│   │   ├── config/
│   │   │   └── WebConfig.java
│   │   ├── model/
│   │   │   ├── Profile.java
│   │   │   ├── Swipe.java
│   │   │   └── Match.java
│   │   ├── repository/
│   │   │   ├── ProfileRepository.java
│   │   │   ├── SwipeRepository.java
│   │   │   └── MatchRepository.java
│   │   ├── service/
│   │   │   ├── ProfileService.java
│   │   │   ├── SwipeService.java
│   │   │   └── MatchService.java
│   │   └── controller/
│   │       ├── ProfileController.java
│   │       ├── SwipeController.java
│   │       └── MatchController.java
│   └── resources/
│       └── application.properties
└── README.md
```

## Current Migration Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Profiles** | ✅ Migrated | Full CRUD through backend |
| **Swipes** | ✅ Migrated | Auto-match detection |
| **Matches** | ✅ Migrated | Get, delete, deactivate |
| **Messages** | ❌ Not migrated | Still uses Supabase directly |
| **Auth** | ❌ Not migrated | Uses Supabase Auth (recommended) |

## Benefits Achieved

### For Profiles
- ✅ Centralized validation
- ✅ BigDecimal for financial data
- ✅ Proper field updates

### For Swipes/Matches
- ✅ Automatic match detection
- ✅ Duplicate prevention
- ✅ Single API call for swipe+match
- ✅ Server-side business logic
- ✅ Transactional integrity

## Running the Application

### Development Mode
```bash
# Terminal 1: Start Backend
cd backend
mvn spring-boot:run

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Backend
cd backend
mvn clean package
java -jar target/backend-1.0.0.jar

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to static hosting
```

## Troubleshooting

### Port 8080 in use
```bash
lsof -ti:8080 | xargs kill -9
```

### Database connection issues
- Check credentials in application.properties
- Verify Supabase project is running
- Test connection: `curl http://localhost:8080/api/profiles`

### Frontend can't reach backend
- Ensure backend is running on port 8080
- Check CORS configuration in WebConfig.java
- Verify frontend proxy in vite.config.ts (optional)

---

**Architecture Status:** ✅ Production-ready for profiles, swipes, and matches!

