import { AlertCircle, LogOut, LogIn, UserPlus , Shield} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const Navbar = ({ authButton }) => {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    navigate("/signin")
  }

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
        <Shield className="h-6 w-15 text-blue-600" />
          <h1 className="text-xl font-bold">FraudShield</h1>
        </div>
        <nav className="flex items-center space-x-4">
          {authButton === "signin" ? (
            <Link
              to="/signin"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Link>
          ) : authButton === "signup" ? (
            <Link
              to="/signup"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <UserPlus className="h-5 w-5" />
              <span>Sign Up</span>
            </Link>
          ) : (
            <>
              <a
                href="#"
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
