# TopTrait Spring Boot Backend

A Java Spring Boot REST API backend for the TopTrait roommate matching application.

## Overview

This backend provides REST API endpoints for profile CRUD operations, connecting to the existing Supabase PostgreSQL database. The frontend now routes profile operations through this backend instead of calling Supabase directly.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** (Hibernate)
- **PostgreSQL** (Supabase)
- **Maven** for dependency management

## Project Structure

```
backend/
├── pom.xml                                    # Maven dependencies
├── src/main/
│   ├── java/com/team6/backend/
│   │   ├── BackendApplication.java            # Main application class
│   │   ├── config/
│   │   │   └── WebConfig.java                 # CORS configuration
│   │   ├── model/
│   │   │   └── Profile.java                   # JPA entity for profiles table
│   │   ├── repository/
│   │   │   └── ProfileRepository.java         # JPA repository interface
│   │   ├── service/
│   │   │   └── ProfileService.java            # Business logic layer
│   │   └── controller/
│   │       └── ProfileController.java         # REST API endpoints
│   └── resources/
│       └── application.properties             # Database configuration
```

## Database Configuration

The backend connects to Supabase PostgreSQL using the Session Pooler (port 6543) for IPv4 compatibility.

**Connection details in `application.properties`:**
```properties
spring.datasource.url=jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:6543/postgres
spring.datasource.username=postgres.pwbbdilghlmkvszoaxpe
spring.datasource.password=CSCI201MoJiang
```

## API Endpoints

### Profile Operations

All endpoints are prefixed with `/api/profiles`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profiles` | Create a new profile |
| GET | `/api/profiles/user/{userId}` | Get profile by user ID |
| PUT | `/api/profiles/user/{userId}` | Update profile by user ID |
| GET | `/api/profiles?excludeUserId={id}` | Get all profiles (optionally exclude one) |
| DELETE | `/api/profiles/user/{userId}` | Delete profile by user ID |

### Example Requests

**Create Profile:**
```bash
curl -X POST http://localhost:8080/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@usc.edu",
    "fullName": "John Doe",
    "age": 20,
    "major": "Computer Science",
    "school": "Viterbi",
    "year": "sophomore",
    "bio": "Looking for a roommate",
    "budgetMin": 800,
    "budgetMax": 1500,
    "cleanlinessRating": 7
  }'
```

**Get Profile:**
```bash
curl http://localhost:8080/api/profiles/user/123e4567-e89b-12d3-a456-426614174000
```

**Get All Profiles:**
```bash
curl http://localhost:8080/api/profiles
# Or exclude current user:
curl http://localhost:8080/api/profiles?excludeUserId=123e4567-e89b-12d3-a456-426614174000
```

## Running the Backend

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Start the Server

```bash
cd backend
mvn spring-boot:run
```

The backend will start on **http://localhost:8080**

### Build JAR

```bash
mvn clean package
java -jar target/backend-1.0.0.jar
```

## Frontend Integration

The frontend (`frontend/src/figmalib/database.ts`) now calls this backend API instead of Supabase directly:

```typescript
// Old: Direct Supabase call
const { data } = await supabase.from('profiles').select('*');

// New: Backend API call
const profiles = await getAllProfilesAPI(excludeUserId);
```

## CORS Configuration

The backend allows requests from `http://localhost:5173` (Vite dev server). This is configured in `WebConfig.java`.

## Development Notes

- **JPA Validation Mode**: Set to `validate` - the backend validates against the existing database schema without modifying it
- **BigDecimal for Money**: Uses `BigDecimal` for `budget_min` and `budget_max` fields (better for financial data)
- **UUID Primary Keys**: Profiles use UUID for `id` and `user_id` fields
- **Auto-timestamps**: `created_at` and `updated_at` are automatically managed by JPA lifecycle hooks

## Troubleshooting

### Port Already in Use
If you see "Port 8080 was already in use":
```bash
# Kill existing process
lsof -ti:8080 | xargs kill -9
# Then restart
mvn spring-boot:run
```

### Database Connection Issues
- Verify Supabase credentials in `application.properties`
- Check that the Session Pooler endpoint is accessible
- Ensure your IP is allowed in Supabase dashboard (if IP restrictions are enabled)

### Schema Validation Errors
The backend uses `hibernate.ddl-auto=validate` which checks that Java entities match the database schema. If you see validation errors:
1. Check that the `Profile.java` entity matches the `profiles` table structure
2. Verify column types match (e.g., `NUMERIC` → `BigDecimal`, `TEXT` → `String`)

## Testing

Test the backend is running:
```bash
curl http://localhost:8080/api/profiles
```

You should see JSON array of profiles from the database.

## License

MIT

