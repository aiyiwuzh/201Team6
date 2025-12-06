# Supabase Database Setup Guide

## 1. Get Your Supabase Connection Details

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon in sidebar)
3. Navigate to **Database** section
4. Look for **Connection string** section
5. Copy the **Connection pooling** URI (recommended for better performance)

Your connection string will look like:
```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

## 2. Configure Backend Connection

Open `backend/src/main/resources/application.properties` and replace the placeholders:

```properties
spring.datasource.url=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres
spring.datasource.username=postgres.[PROJECT_REF]
spring.datasource.password=[YOUR_PASSWORD]
```

### Breaking down the connection URL:

From this Supabase connection string:
```
postgresql://postgres.abcdefghijklmnop:mypassword123@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

Extract:
- **Host**: `aws-0-us-east-1.pooler.supabase.com:5432`
- **Username**: `postgres.abcdefghijklmnop`
- **Password**: `mypassword123`

Then configure:
```properties
spring.datasource.url=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres
spring.datasource.username=postgres.abcdefghijklmnop
spring.datasource.password=mypassword123
```

## 3. Alternative: Use Environment Variables (Recommended)

For better security, use environment variables instead of hardcoding credentials:

1. Create a file named `.env` in the `backend` directory (already in .gitignore):

```env
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_USERNAME=postgres.abcdefghijklmnop
DB_PASSWORD=mypassword123
```

2. Update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:5432/postgres
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:password}
```

3. Set environment variables before running:

```bash
export DB_HOST=aws-0-us-east-1.pooler.supabase.com
export DB_USERNAME=postgres.abcdefghijklmnop
export DB_PASSWORD=mypassword123
mvn spring-boot:run
```

## 4. Verify Connection

After configuring, the backend will automatically:
- Connect to your Supabase database
- Create the `items` table if it doesn't exist
- Be ready to handle CRUD operations

## 5. Database Schema

The application will create this table automatically:

```sql
CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 6. Test the Connection

1. Start the backend: `cd backend && mvn spring-boot:run`
2. Check the console logs for:
   - ✅ "Hibernate: create table items..." (first time only)
   - ✅ No connection errors
3. Start the frontend: `cd frontend && npm run dev`
4. Open http://localhost:5173
5. Try creating an item in the "Database CRUD Operations" section

## Troubleshooting

### Connection Refused
- Verify your Supabase project is active
- Check if you're using the correct host (pooler vs direct connection)
- Ensure your IP is allowed (Supabase → Settings → Database → Connection pooling)

### Authentication Failed
- Double-check your username and password
- Make sure you're using the database password, not your Supabase account password
- Reset database password in Supabase if needed (Settings → Database → Database password)

### Table Already Exists Error
- Set `spring.jpa.hibernate.ddl-auto=update` (already configured)
- Or manually create/drop tables in Supabase SQL Editor

## Security Notes

⚠️ **Never commit your actual credentials to Git!**
- Use environment variables
- Keep `.env` files in `.gitignore`
- Use Supabase's Row Level Security (RLS) for production

## Need Help?

Check Supabase documentation: https://supabase.com/docs/guides/database/connecting-to-postgres

