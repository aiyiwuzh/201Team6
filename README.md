# React + Spring Boot Full Stack Application

A full-stack boilerplate application with React/TypeScript frontend and Spring Boot backend.

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

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## API Endpoints

The backend provides the following endpoints:

- **GET** `/api/hello` - Returns a hello message
- **GET** `/api/status` - Returns backend status and timestamp
- **POST** `/api/echo` - Echoes back the message sent in the request body

### Example Request

```bash
# GET request
curl http://localhost:8080/api/hello

# POST request
curl -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

## Features

- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ Spring Boot 3.2
- ✅ CORS configured
- ✅ Axios for API calls
- ✅ Modern, responsive UI
- ✅ GET and POST request examples

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

## License

MIT

