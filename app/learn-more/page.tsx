"use client";

export default function LearnMorePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-16 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Animated Gradient Blobs */}
      <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/10 rounded-full filter blur-3xl animate-blob z-0" />
      <div className="absolute bottom-20 right-20 w-56 sm:w-80 h-56 sm:h-80 bg-cyan-400/10 rounded-full filter blur-3xl animate-blob animation-delay-2000 z-0" />
      <div className="absolute top-1/2 left-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-400/10 rounded-full filter blur-3xl animate-blob animation-delay-4000 z-0" style={{transform: 'translate(-50%, -50%)'}} />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-700 text-center mb-8 sm:mb-10 drop-shadow-lg">How Fair Car Repair Works</h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-6">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center bg-white/90 rounded-2xl shadow-xl border border-blue-100 w-full sm:w-80 md:w-96 px-4 sm:px-6 py-6 max-w-full transition-all duration-300 hover:shadow-blue-400/20 min-h-[170px] justify-center">
            <div className="bg-blue-100 text-blue-600 rounded-full p-2 sm:p-3 mb-2 shadow-md">
              <svg className="w-6 sm:w-8 h-6 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold mb-1">Submit Your Repair Request</h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-snug">Describe your car's problem or upload a diagnostic report. Our AI matches you with the best mechanics.</p>
          </div>
          {/* Connector */}
          <div className="hidden md:block h-2 w-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-2" />
          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center bg-white/90 rounded-2xl shadow-xl border border-blue-100 w-full sm:w-80 md:w-96 px-4 sm:px-6 py-6 max-w-full transition-all duration-300 hover:shadow-blue-400/20 min-h-[170px] justify-center">
            <div className="bg-cyan-100 text-cyan-600 rounded-full p-2 sm:p-3 mb-2 shadow-md">
              <svg className="w-6 sm:w-8 h-6 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1h-6a1 1 0 00-1 1v9m0 0l4 4 4-4" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold mb-1">Compare Quotes</h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-snug">Mechanics send you their best offers. Compare prices, reviews, and options all in one place.</p>
          </div>
          {/* Connector */}
          <div className="hidden md:block h-2 w-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-2" />
          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center bg-white/90 rounded-2xl shadow-xl border border-blue-100 w-full sm:w-80 md:w-96 px-4 sm:px-6 py-6 max-w-full transition-all duration-300 hover:shadow-blue-400/20 min-h-[170px] justify-center">
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-2 sm:p-3 mb-2 shadow-md">
              <svg className="w-6 sm:w-8 h-6 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold mb-1">Book & Get Repaired</h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-snug">Choose your mechanic, book the service, and get your car fixed with confidence.</p>
          </div>
        </div>
        {/* Mobile connectors */}
        <div className="flex md:hidden flex-col items-center my-6 sm:my-8 gap-2">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
        </div>
        <div className="mt-12 sm:mt-16 text-center">
          <a href="/report" className="inline-block w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300">Get Started</a>
        </div>
      </div>
      {/* Add CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 