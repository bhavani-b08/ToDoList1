import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Filter, Bell } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">TaskFlow</h1>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In with Google
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Smart Task Management
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Stay organized and productive with TaskFlow. Manage tasks, collaborate with others, and never miss a deadline.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="px-8 py-3"
          >
            Get Started for Free
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Task Management</h3>
              <p className="text-sm text-slate-600">Create, edit, and track your tasks with ease</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Collaboration</h3>
              <p className="text-sm text-slate-600">Share tasks and collaborate with your team</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Filter className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Smart Filtering</h3>
              <p className="text-sm text-slate-600">Filter tasks by status, date, and priority</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Real-time Updates</h3>
              <p className="text-sm text-slate-600">Stay in sync with automatic updates</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">
            Ready to boost your productivity?
          </h3>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
          >
            Start Managing Tasks Now
          </Button>
        </div>
      </main>
    </div>
  );
}
