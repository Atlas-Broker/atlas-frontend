import { auth } from '@clerk/nextjs/server';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Redirect to dashboard if already signed in
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Logo/Brand */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Atlas
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-Powered Swing Trading for US Equities
          </p>
          
          {/* Description */}
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Let our AI agent analyze markets, identify opportunities, and execute trades on your behalf.
            From full observation to autonomous trading, you&apos;re in control.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl">
                Get Started
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Driven Analysis</h3>
            <p className="text-gray-600">
              Advanced algorithms analyze market patterns, technical indicators, and sentiment to identify high-probability trades.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk-Controlled Trading</h3>
            <p className="text-gray-600">
              Set position limits, stop losses, and risk parameters. Your agent trades within boundaries you define.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Autonomy</h3>
            <p className="text-gray-600">
              Choose your comfort level: Observer, Copilot, Guarded Auto, or Full Auto. Change anytime.
            </p>
          </div>
        </div>

        {/* Paper Trading Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Start with paper trading - No real money required</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Atlas Trading Platform. Phase 1 - Paper Trading Only.
          </p>
        </div>
      </footer>
    </div>
  );
}
