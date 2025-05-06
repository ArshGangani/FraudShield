import { AlertCircle, Home, User, LogOut } from "lucide-react"

const Navbar = () => {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <h1 className="text-xl font-bold">FraudShield</h1>
        </div>
        <nav className="flex items-center space-x-6">
          <a href="#" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </a>
          <a href="#" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </a>
          <a href="#" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
