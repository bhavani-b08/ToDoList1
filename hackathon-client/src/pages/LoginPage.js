// Login Page with Google OAuth
// This project is a part of a hackathon run by https://www.katomaran.com

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Shield, Users, Zap } from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "Secure Authentication",
      description: "Login safely with your Google account"
    },
    {
      icon: <Users className="w-6 h-6 text-green-500" />,
      title: "Team Collaboration",
      description: "Share and collaborate on tasks with others"
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      title: "Real-time Updates",
      description: "Stay synced across all your devices"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Features */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TodoApp
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Sign in to access your tasks and continue where you left off. 
              Built for the Katomaran hackathon with powerful collaboration features.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in to your account
            </h3>
            <p className="text-gray-600">
              Choose your preferred sign-in method
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Secure & Fast</span>
              </div>
            </div>

            {/* Info */}
            <div className="text-center text-sm text-gray-500">
              <p>
                By signing in, you agree to our terms of service and privacy policy.
                Your data is protected and secure.
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-400 text-sm text-center">
          This project is a part of a hackathon run by{' '}
          <a 
            href="https://www.katomaran.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            https://www.katomaran.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;