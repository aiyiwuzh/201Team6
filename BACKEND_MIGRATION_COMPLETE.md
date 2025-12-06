# Backend Migration Complete! 🎉

The profile CRUD operations have been successfully migrated from direct Supabase calls to a Spring Boot backend API.

## What Was Done

### ✅ Backend Created (from scratch)
- **Spring Boot 3.2.0** backend with Java 17
- **Profile Entity** with JPA annotations matching your Supabase schema
- **REST API** with full CRUD operations
- **Database Connection** configured to Supabase PostgreSQL (Session Pooler)
- **CORS** configured for frontend access

### ✅ Frontend Updated
- Modified `frontend/src/figmalib/database.ts` to call backend API instead of Supabase
- Updated `frontend/src/services/api.ts` with profile API functions
- All profile operations now route through the backend

### ✅ Tested & Working
- Backend successfully connects to database ✓
- Profile API endpoints return data ✓
- Frontend code updated to use backend API ✓

## Architecture

```
Frontend (React)
    ↓ HTTP Requests
Backend (Spring Boot) :8080
    ↓ JDBC
Supabase PostgreSQL Database
```

## Running the Application

### 1. Start the Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on **http://localhost:8080**

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on **http://localhost:5173**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profiles` | Create profile |
| GET | `/api/profiles/user/{userId}` | Get profile by user ID |
| PUT | `/api/profiles/user/{userId}` | Update profile |
| GET | `/api/profiles?excludeUserId={id}` | Get all profiles |
| DELETE | `/api/profiles/user/{userId}` | Delete profile |

## Files Changed/Created

### Backend (New)
- `backend/pom.xml` - Maven configuration
- `backend/src/main/resources/application.properties` - Database config
- `backend/src/main/java/com/team6/backend/BackendApplication.java` - Main class
- `backend/src/main/java/com/team6/backend/config/WebConfig.java` - CORS
- `backend/src/main/java/com/team6/backend/model/Profile.java` - JPA entity
- `backend/src/main/java/com/team6/backend/repository/ProfileRepository.java` - Repository
- `backend/src/main/java/com/team6/backend/service/ProfileService.java` - Business logic
- `backend/src/main/java/com/team6/backend/controller/ProfileController.java` - REST endpoints
- `backend/README.md` - Documentation

### Frontend (Modified)
- `frontend/src/services/api.ts` - Added profile API functions
- `frontend/src/figmalib/database.ts` - Changed profile functions to call backend API

## What Still Uses Supabase Directly

The following operations still connect to Supabase directly (not migrated):
- **Authentication** - `supabase.auth` methods
- **Swipes** - `createSwipe`, `getUserSwipes`
- **Matches** - `getUserMatches`, `createMatch`
- **Messages** - `sendMessage`, `getMessages`, `subscribeToMessages`

Only **Profile CRUD** operations now go through the backend.

## Testing

### Test Backend Directly
```bash
# Get all profiles
curl http://localhost:8080/api/profiles

# Get specific profile
curl http://localhost:8080/api/profiles/user/{userId}
```

### Test Full Stack
1. Start backend: `cd backend && mvn spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to Profile Page in the app
4. Edit and save your profile
5. Check that changes persist (backend API is being used)

## Database Credentials

Located in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:6543/postgres
spring.datasource.username=postgres.pwbbdilghlmkvszoaxpe
spring.datasource.password=CSCI201MoJiang
```

## Next Steps (Optional)

To migrate other operations to the backend:
1. Create additional controllers (SwipeController, MatchController, MessageController)
2. Create corresponding entities, repositories, and services
3. Update frontend database.ts functions to call backend APIs
4. Consider adding authentication middleware to secure endpoints

## Notes

- Backend uses **BigDecimal** for `budget_min`/`budget_max` (better for financial data)
- All profile operations are transactional
- Schema validation ensures backend matches database structure
- CORS configured to allow requests from `localhost:5173`

---

**Migration Status:** ✅ COMPLETE

All profile CRUD operations now flow through the Spring Boot backend!

