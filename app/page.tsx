import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Simple Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">RAKlife Business</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button>Business Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            The Future of Membership Management
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Complete Platform for<br />
            <span className="text-blue-600">Sports Academies & Gyms</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            One platform to manage members, schedule classes, automate billing, 
            and recover payments. Everything you need to run your business efficiently.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            💳 No credit card required • 🚀 Setup in 5 minutes • 💰 Free for 30 days
          </p>
        </div>
      </section>

      {/* Current Focus Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12" id="payment-recovery">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              🎯 Available Now
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Start with Payment Recovery
            </h2>
            <p className="text-xl text-blue-100">
              While we build the complete platform, let's get your overdue payments recovered. 
              <br />Most businesses recover <strong className="text-white">70-95%</strong> in the first 30 days.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="mt-4">
                Get Started with Payment Recovery
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Recovery Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Payment Recovery System</h2>
            <p className="text-gray-600 text-lg">Available right now. Get your cash flow back on track.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Payment Links</h3>
              <p className="text-gray-600">
                Import your overdue members and instantly send payment links via Stripe. 
                Money goes directly to your account.
              </p>
              <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Available Now
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Chase Schedule</h3>
              <p className="text-gray-600">
                Set up automatic reminders (Day 7, 14, 21, 30). System chases overdue 
                payments so you don't have to.
              </p>
              <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Available Now
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Dashboard</h3>
              <p className="text-gray-600">
                Track recovery metrics, see who's paid, monitor success rates. 
                All your data in one place.
              </p>
              <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Available Now
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">CSV Import</h3>
              <p className="text-gray-600">
                Upload your entire member list with overdue amounts in seconds. 
                Simple CSV format, no complex setup.
              </p>
              <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Available Now
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/signup">
              <Button size="lg">
                Start Recovering Payments Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Coming Soon Features */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                🚀 Coming Soon
              </div>
              <h2 className="text-3xl font-bold mb-4">Complete Platform In Development</h2>
              <p className="text-gray-600 text-lg">
                Join early and get lifetime discounts when these features launch
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 opacity-75">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Member Management</h3>
                <p className="text-gray-600 text-sm">
                  Complete member database with parent + child profiles, contact management, 
                  and enrollment tracking.
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Q2 2026
                </div>
              </Card>

              <Card className="p-6 opacity-75">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Class Scheduling</h3>
                <p className="text-gray-600 text-sm">
                  Create classes, assign members, manage capacity, and view schedules. 
                  Everything in one place.
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Q2 2026
                </div>
              </Card>

              <Card className="p-6 opacity-75">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
                <p className="text-gray-600 text-sm">
                  Track attendance, revenue, member growth, and more. 
                  Make data-driven decisions.
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Q2 2026
                </div>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                🎁 <strong>Early Adopter Benefit:</strong> Lock in 50% off lifetime when you join during payment recovery phase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-blue-600">70-95%</div>
              <p className="text-xl font-semibold">Average Recovery Rate</p>
              <p className="text-gray-600">
                Our payment recovery system helps sports academies and gyms recover 
                70-95% of overdue payments in the first 30 days.
              </p>
              <div className="pt-4">
                <Link href="/signup">
                  <Button size="lg">
                    See How It Works
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">
              Ready to Get Your Money Back?
            </h2>
            <p className="text-xl text-gray-300">
              Start with payment recovery today. Free for 30 days, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              Questions? Email us at hello@raklife.app
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 RAKlife. Built for sports academies and gyms in UAE.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
