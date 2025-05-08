import Dashboard from "./components/Dashboard"
import "./index.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import SigninPage from "./components/SigninPage"
import SignupPage from "./components/SignupPage"
import LandingPage from "./components/Landing"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
