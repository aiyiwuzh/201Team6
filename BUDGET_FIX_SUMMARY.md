# Budget Save Issue - Fixed! ✅

## Problem
Budget range values (budget_min, budget_max) were not saving correctly when editing profiles through the frontend.

## Root Causes

### 1. JSON Property Name Mismatch
- **Issue**: Frontend sends snake_case JSON (`budget_min`, `budget_max`) but Java backend used camelCase field names (`budgetMin`, `budgetMax`)
- **Result**: Spring Boot couldn't map the JSON fields to Java object fields, so budget values were always null when received by the backend

### 2. Update Logic Not Handling Null Values
- **Issue**: The ProfileService only updated fields if they were non-null, which prevented clearing budget values
- **Result**: Once set, budget values couldn't be changed or cleared

### 3. PostgreSQL Prepared Statement Caching
- **Issue**: Supabase's connection pooler had conflicts with PostgreSQL's prepared statement cache
- **Result**: Database connection errors when trying to save updates

## Fixes Applied

### Fix 1: Added Jackson JSON Property Annotations
**File**: `backend/src/main/java/com/team6/backend/model/Profile.java`

Added `@JsonProperty` annotations to map snake_case JSON to camelCase Java fields:

```java
@JsonProperty("budget_min")
@Column(name = "budget_min")
private BigDecimal budgetMin;

@JsonProperty("budget_max")
@Column(name = "budget_max")
private BigDecimal budgetMax;

@JsonProperty("user_id")
private UUID userId;

@JsonProperty("full_name")
private String fullName;

// ... etc for other fields
```

**Result**: Backend now correctly receives and returns budget values in snake_case format that frontend expects.

### Fix 2: Updated ProfileService to Handle Budget Values
**File**: `backend/src/main/java/com/team6/backend/service/ProfileService.java`

Changed update logic to always set budget fields (allowing null values):

```java
// Budget fields - always update (allow explicit null to clear)
existingProfile.setBudgetMin(profileData.getBudgetMin());
existingProfile.setBudgetMax(profileData.getBudgetMax());
existingProfile.setCleanlinessRating(profileData.getCleanlinessRating());
```

**Result**: Budget values can now be updated or cleared (set to null).

### Fix 3: Disabled Prepared Statement Caching
**File**: `backend/src/main/resources/application.properties`

Updated JDBC URL to disable prepared statement caching:

```properties
spring.datasource.url=jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:6543/postgres?prepareThreshold=0&preparedStatementCacheQueries=0
```

**Result**: Eliminated database connection errors with Supabase's pooler.

## Testing

Verified the fix works:

```bash
# Test updating budget values
curl -X PUT "http://localhost:8080/api/profiles/user/{userId}" \
  -H "Content-Type: application/json" \
  -d '{
    "budget_min": 900,
    "budget_max": 1600
  }'

# Response shows values saved correctly:
{
  "budget_min": 900.0,
  "budget_max": 1600.0,
  ...
}
```

## How to Use

1. **Start the backend** (if not running):
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Use the Profile Page** in your app:
   - Navigate to the Profile page
   - Enter your budget min/max values
   - Click "Save Profile"
   - Budget values will now persist correctly!

3. **Verify**: Refresh the page or log out and back in - your budget values should be saved.

## Technical Details

### Data Flow
```
Frontend Form
    ↓ (enters 900, 1600)
JavaScript (profile.budget_min, profile.budget_max)
    ↓ (sends JSON)
{
  "budget_min": 900,
  "budget_max": 1600
}
    ↓ (HTTP POST/PUT)
Spring Boot Controller
    ↓ (@JsonProperty maps fields)
Profile Java Object (budgetMin, budgetMax)
    ↓ (JPA saves)
PostgreSQL Database (budget_min, budget_max columns)
```

### Field Type Mapping
- **Frontend**: `number | null`
- **JSON**: `number | null`
- **Java**: `BigDecimal` (better for financial data than Double)
- **Database**: `NUMERIC` (PostgreSQL type)

## Files Modified

1. `backend/src/main/java/com/team6/backend/model/Profile.java`
   - Added `@JsonProperty` annotations

2. `backend/src/main/java/com/team6/backend/service/ProfileService.java`
   - Updated budget field handling in update method

3. `backend/src/main/resources/application.properties`
   - Added prepared statement parameters to JDBC URL

## Status

✅ **FIXED** - Budget values now save and load correctly!

Backend is running on port 8080 and ready to handle profile updates.

