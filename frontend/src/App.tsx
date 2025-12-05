// import { useState, useEffect } from 'react'
// import './App.css'
// import { getHello, getStatus, postEcho } from './services/api'
// import ItemManager from './components/ItemManager'

// interface StatusResponse {
//   status: string;
//   timestamp: number;
//   service: string;
// }

// interface HelloResponse {
//   message: string;
//   status: string;
// }

// interface EchoResponse {
//   received: string;
//   echoed: string;
// }

// function App() {
//   const [message, setMessage] = useState<string>('')
//   const [status, setStatus] = useState<StatusResponse | null>(null)
//   const [helloMessage, setHelloMessage] = useState<string>('')
//   const [echoInput, setEchoInput] = useState<string>('')
//   const [echoResponse, setEchoResponse] = useState<string>('')
//   const [loading, setLoading] = useState<boolean>(false)

//   useEffect(() => {
//     fetchStatus()
//   }, [])

//   const fetchStatus = async () => {
//     try {
//       const data = await getStatus()
//       setStatus(data)
//     } catch (error) {
//       console.error('Error fetching status:', error)
//     }
//   }

//   const fetchHello = async () => {
//     setLoading(true)
//     try {
//       const data: HelloResponse = await getHello()
//       setHelloMessage(data.message)
//     } catch (error) {
//       console.error('Error fetching hello:', error)
//       setHelloMessage('Error connecting to backend')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const sendEcho = async () => {
//     if (!echoInput.trim()) return
    
//     setLoading(true)
//     try {
//       const data: EchoResponse = await postEcho(echoInput)
//       setEchoResponse(data.echoed)
//     } catch (error) {
//       console.error('Error sending echo:', error)
//       setEchoResponse('Error connecting to backend')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="App">
//       <h1>React + Spring Boot + Supabase</h1>
      
//       <div className="card">
//         <h2>Backend Status</h2>
//         {status ? (
//           <div className="status-info">
//             <p><strong>Service:</strong> {status.service}</p>
//             <p><strong>Status:</strong> <span className="status-badge">{status.status}</span></p>
//             <p><strong>Timestamp:</strong> {new Date(status.timestamp).toLocaleString()}</p>
//           </div>
//         ) : (
//           <p>Loading status...</p>
//         )}
//         <button onClick={fetchStatus}>Refresh Status</button>
//       </div>

//       {/* Database CRUD Operations */}
//       <div className="card">
//         <ItemManager />
//       </div>

//       {/* Demo API Endpoints */}
//       <details className="card demo-section">
//         <summary><h2>Demo API Endpoints</h2></summary>
        
//         <div className="demo-content">
//           <div className="demo-card">
//             <h3>GET Request</h3>
//             <button onClick={fetchHello} disabled={loading}>
//               {loading ? 'Loading...' : 'Say Hello'}
//             </button>
//             {helloMessage && (
//               <div className="response-box">
//                 <p>{helloMessage}</p>
//               </div>
//             )}
//           </div>

//           <div className="demo-card">
//             <h3>POST Request</h3>
//             <div className="input-group">
//               <input
//                 type="text"
//                 value={echoInput}
//                 onChange={(e) => setEchoInput(e.target.value)}
//                 placeholder="Enter a message"
//                 onKeyPress={(e) => e.key === 'Enter' && sendEcho()}
//               />
//               <button onClick={sendEcho} disabled={loading || !echoInput.trim()}>
//                 {loading ? 'Sending...' : 'Send Echo'}
//               </button>
//             </div>
//             {echoResponse && (
//               <div className="response-box">
//                 <p>{echoResponse}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </details>
//     </div>
//   )
// }

// export default App

import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your real pages
import {CoverPage} from "./figma_components/CoverPage";
import {ProfilePage} from "./figma_components/ProfilePage";
import {SwipingPage} from "./figma_components/SwipingPage";
import {MatchesPage} from "./figma_components/MatchesPage";
import {MessagingPage} from "./figma_components/MessagingPage";
import {SettingsPage} from "./figma_components/SettingsPage";

// Import Figma UI ONLY for preview purposes
import FigmaUI from "./pages/FigmaUI";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Real Application Routes */}
        <Route path="/" element={<CoverPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/swipe" element={<SwipingPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/chat" element={<MessagingPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Figma UI Preview Route */}
        <Route path="/figma" element={<FigmaUI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

