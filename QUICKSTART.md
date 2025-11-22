# Quick Start Guide

## 🚀 Running the Application

### Start the Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run
```
Backend will be available at: **http://localhost:8080**

### Start the Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend will be available at: **http://localhost:5173**

## ✅ Testing the API

Once both servers are running, open http://localhost:5173 in your browser.

You'll see an interactive UI with:
- **Backend Status** - Shows real-time connection status
- **GET Request Demo** - Click "Say Hello" to test GET endpoint
- **POST Request Demo** - Enter text and click "Send Echo" to test POST endpoint

## 📡 API Endpoints

Test directly with curl:

```bash
# GET Hello
curl http://localhost:8080/api/hello

# GET Status
curl http://localhost:8080/api/status

# POST Echo
curl -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

## 🛠️ Development Commands

### Backend
```bash
cd backend
mvn spring-boot:run     # Run the app
mvn clean install       # Build and install dependencies
mvn clean               # Clean build artifacts
```

### Frontend
```bash
cd frontend
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

## 📁 Project Structure

```
201Team6/
├── backend/
│   ├── src/main/java/com/team6/backend/
│   │   ├── BackendApplication.java      # Main Spring Boot app
│   │   └── controller/
│   │       └── ApiController.java       # REST API endpoints
│   └── pom.xml                          # Maven dependencies
│
└── frontend/
    ├── src/
    │   ├── App.tsx                      # Main React component
    │   ├── services/
    │   │   └── api.ts                   # API service layer
    │   └── main.tsx                     # Entry point
    └── package.json                     # npm dependencies
```

## 🎯 Next Steps

1. **Add new API endpoints**: Edit `backend/src/main/java/com/team6/backend/controller/ApiController.java`
2. **Add new React components**: Create files in `frontend/src/components/`
3. **Modify styling**: Edit `frontend/src/App.css` or `frontend/src/index.css`
4. **Add new API calls**: Edit `frontend/src/services/api.ts`

Happy coding! 🎉

