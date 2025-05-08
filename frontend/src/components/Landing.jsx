import { Link , useNavigate} from "react-router-dom";
import {
  Shield,
  Upload,
  FileSpreadsheet,
  BarChart3,
  Download,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import fraudShieldImg from "../assets/Shield_image.png";
import { Button } from "../ui/button"


export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col max-w-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">FraudShield</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Benefits
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/signin')}>
              Log In
            </Button>
            <Button size="sm" onClick={() => navigate('/signup')}>
                Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Protect Your Finances with AI-Powered Fraud Detection
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    FraudShield uses advanced machine learning to detect suspicious transactions in your financial
                    history, helping you stay one step ahead of fraud.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[500px]">
                  <div className="overflow-hidden rounded-lg border bg-background p-2 shadow-xl">
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">FraudShield Dashboard</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Last scan: Today, 10:45 AM</span>
                          </div>
                        </div>
                        <div className="h-[300px] rounded-md border bg-white p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">Transaction Analysis</h3>
                              <span className="text-xs text-muted-foreground">98 transactions processed</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="rounded-lg border bg-green-50 p-3 text-center">
                                <div className="text-2xl font-bold text-green-600">94</div>
                                <div className="text-xs text-muted-foreground">Safe</div>
                              </div>
                              <div className="rounded-lg border bg-yellow-50 p-3 text-center">
                                <div className="text-2xl font-bold text-yellow-600">3</div>
                                <div className="text-xs text-muted-foreground">Suspicious</div>
                              </div>
                              <div className="rounded-lg border bg-red-50 p-3 text-center">
                                <div className="text-2xl font-bold text-red-600">1</div>
                                <div className="text-xs text-muted-foreground">Fraudulent</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between rounded-md border bg-red-50 p-2">
                                <div className="flex items-center space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <span className="text-sm">International Transfer - $1,200.00</span>
                                </div>
                                <span className="text-xs font-medium text-red-600">High Risk</span>
                              </div>
                              <div className="flex items-center justify-between rounded-md border bg-yellow-50 p-2">
                                <div className="flex items-center space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <span className="text-sm">Online Purchase - $499.99</span>
                                </div>
                                <span className="text-xs font-medium text-yellow-600">Suspicious</span>
                              </div>
                              <div className="flex items-center justify-between rounded-md border bg-green-50 p-2">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">Grocery Store - $78.52</span>
                                </div>
                                <span className="text-xs font-medium text-green-600">Safe</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Advanced Fraud Detection Made Simple
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  FraudShield combines powerful AI with an intuitive interface to help you identify and prevent
                  financial fraud.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-blue-100 p-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">File Upload</h3>
                <p className="text-center text-muted-foreground">
                  Easily upload your transaction history files in CSV or PDF format for quick analysis.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-blue-100 p-3">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Batch Processing</h3>
                <p className="text-center text-muted-foreground">
                  Process all your transactions at once, with anomalies flagged in the entire dataset.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-blue-100 p-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">AI Detection</h3>
                <p className="text-center text-muted-foreground">
                  Powered by Isolation Forest algorithm to detect unusual patterns that may indicate fraud.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-blue-100 p-3">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Result Dashboard</h3>
                <p className="text-center text-muted-foreground">
                  View flagged transactions with anomaly scores and status in an intuitive dashboard.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-blue-100 p-3">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Downloadable Reports</h3>
                <p className="text-center text-muted-foreground">
                  Export your processed results for further review or sharing with your financial institution.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-blue-100 p-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Easy to Use</h3>
                <p className="text-center text-muted-foreground">
                  No technical expertise required - just upload your files and get results in minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Process</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How FraudShield Works</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our streamlined process makes fraud detection simple and effective.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
              <div className="relative flex flex-col items-center space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  1
                </div>
                <Upload className="h-10 w-10 text-blue-600" />
                <h3 className="text-xl font-bold">Upload Your Data</h3>
                <p className="text-center text-muted-foreground">
                  Simply upload your transaction history file (CSV or PDF) through our secure platform.
                </p>
              </div>
              <div className="relative flex flex-col items-center space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  2
                </div>
                <Shield className="h-10 w-10 text-blue-600" />
                <h3 className="text-xl font-bold">AI Analysis</h3>
                <p className="text-center text-muted-foreground">
                  Our machine learning model analyzes your transactions to identify suspicious patterns and anomalies.
                </p>
              </div>
              <div className="relative flex flex-col items-center space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  3
                </div>
                <BarChart3 className="h-10 w-10 text-blue-600" />
                <h3 className="text-xl font-bold">Review Results</h3>
                <p className="text-center text-muted-foreground">
                  View your results in an intuitive dashboard and download detailed reports for further action.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Benefits</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Why Choose FraudShield?</h2>
                <p className="text-muted-foreground md:text-xl">
                  FraudShield offers a comprehensive solution to protect your finances from fraud.
                </p>
                <ul className="grid gap-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold">Early Fraud Detection</h3>
                      <p className="text-muted-foreground">
                        Identify suspicious transactions before they cause significant damage.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold">Time Saving</h3>
                      <p className="text-muted-foreground">
                        Automatically analyze hundreds of transactions in minutes instead of hours of manual review.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold">Advanced AI Technology</h3>
                      <p className="text-muted-foreground">
                        Leverage the power of machine learning to detect patterns that humans might miss.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold">Easy to Use</h3>
                      <p className="text-muted-foreground">
                        No technical expertise required - designed for everyday users.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[500px] overflow-hidden rounded-lg border shadow-xl">
                  <img
                    src={fraudShieldImg}
                    alt="FraudShield Benefits"
                    className="w-full object-cover"
                    width={800}
                    height={600}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="space-y-2 text-white">
                      <h3 className="text-xl font-bold">Peace of Mind</h3>
                      <p className="text-sm">
                        Rest easy knowing your financial transactions are being monitored for suspicious activity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <p className="text-sm text-muted-foreground">© 2025 FraudShield. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}