# React + Spring Boot + Supabase Full Stack Application

A full-stack application with React/TypeScript frontend, Spring Boot backend, and PostgreSQL database (Supabase) with complete CRUD operations.

## Project Structure

```
201Team6/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── services/  # API integration
│   │   ├── App.tsx    # Main application component
│   │   └── main.tsx   # Entry point
│   └── package.json
└── backend/           # Spring Boot + Java
    ├── src/
    │   └── main/
    │       ├── java/
    │       │   └── com/team6/backend/
    │       │       ├── BackendApplication.java
    │       │       └── controller/
    │       │           └── ApiController.java
    │       └── resources/
    │           └── application.properties
    └── pom.xml
```

## Prerequisites

- **Frontend**: Node.js 18+ and npm ✅ (dependencies installed)
- **Backend**: Java 17+ and Maven ✅ (Maven installed, dependencies built)
- **Database**: Supabase account with a PostgreSQL database ⚠️ (needs configuration)

## Getting Started

### Step 1: Configure Database Connection

Before running the backend, configure your Supabase connection:

1. Open `backend/src/main/resources/application.properties`
2. Replace the placeholder values with your actual Supabase credentials

📖 **See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed setup instructions**

### Step 2: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the application:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`  
   On first run, it will automatically create the database tables!

### Step 3: Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Run the development server (dependencies already installed):
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## API Endpoints

### CRUD Operations (Database)

- **POST** `/api/items` - Create a new item
- **GET** `/api/items` - Get all items
- **GET** `/api/items/{id}` - Get a specific item
- **PUT** `/api/items/{id}` - Update an item
- **DELETE** `/api/items/{id}` - Delete an item
- **DELETE** `/api/items` - Delete all items

### Demo Endpoints

- **GET** `/api/hello` - Returns a hello message
- **GET** `/api/status` - Returns backend status and timestamp
- **POST** `/api/echo` - Echoes back the message sent in the request body

### Example Requests

```bash
# Create an item
curl -X POST http://localhost:8080/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "My Item", "description": "Description here"}'

# Get all items
curl http://localhost:8080/api/items

# Update an item
curl -X PUT http://localhost:8080/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "description": "New description"}'

# Delete an item
curl -X DELETE http://localhost:8080/api/items/1
```

## Features

### Frontend
- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ Axios for API calls
- ✅ Modern, responsive UI
- ✅ Complete CRUD interface

### Backend
- ✅ Spring Boot 3.2
- ✅ Spring Data JPA
- ✅ PostgreSQL integration
- ✅ RESTful API design
- ✅ CORS configured
- ✅ Auto-DDL database schema generation

### Database
- ✅ Supabase PostgreSQL
- ✅ Automatic table creation
- ✅ Backend-only database access (secure!)
- ✅ Timestamps on all records

## Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development

```bash
cd backend
mvn spring-boot:run           # Run application
mvn clean install             # Build project
mvn spring-boot:run -Dspring-boot.run.profiles=dev  # Run with dev profile
```

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Axios
- CSS3

### Backend
- Spring Boot 3.2
- Java 17
- Maven
- Spring Web
- Spring Data JPA
- Hibernate

### Database
- PostgreSQL (via Supabase)
- Automatic schema management

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference for running the app
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Detailed database setup instructions
- **[DATABASE_INTEGRATION.md](DATABASE_INTEGRATION.md)** - Complete guide to the database integration

## License

MIT

