'use client'

export default function Home() {
  return (
    <div className="relative bg-white overflow-hidden min-h-screen">
      {/* Premium Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-70"></div>
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-100/30 to-transparent"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-20 w-72 h-72 bg-indigo-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwaDQydjQySDM2VjE4eiIgZmlsbD0iI2VlZWVmZiIvPjwvZz48L3N2Zz4=')] opacity-[0.03] z-0"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl py-6 sm:py-10 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="text-left">
                <div className="inline-flex items-center px-3 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                  <span className="text-xs font-medium text-blue-700">Disrupting The Repair Industry</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  <span className="block">Get Fair Car</span>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Repair Quotes</span>
                </h1>
                
                <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
                  Connect with trusted mechanics in your area. Get competitive quotes, compare prices, and choose the best service for your car repair needs.
                </p>
                
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-x-6">
                  <a
                    href="/report"
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Report an Issue
                  </a>
                  <a href="/findmechanics" className="group flex items-center gap-x-2 text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    Find Mechanics 
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="relative hidden lg:block">
                {/* Premium backdrop glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/80 via-cyan-100/50 to-blue-100/80 rounded-[2rem] blur-xl opacity-80"></div>
                
                {/* Main image container with premium styling */}
                <div className="relative overflow-hidden rounded-[1.25rem] shadow-2xl shadow-blue-600/10 group hover:shadow-blue-600/20 transition-all duration-500">
                  {/* Inner gradient overlay for color harmonization */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 mix-blend-overlay z-10 group-hover:opacity-80 transition-opacity duration-700"></div>
                  
                  {/* Subtle reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent z-20 opacity-60 group-hover:opacity-70 transition-opacity duration-700"></div>
                  
                  {/* Premium border treatment */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[1.25rem] z-30 group-hover:ring-white/30 transition-all duration-500"></div>
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[1.25rem] z-30"></div>
                  
                  {/* The image */}
                  <img 
                    src="/robot-mascot.jpg" 
                    alt="AI robot mechanic with diagnostic tablet and smart tire" 
                    className="w-full relative z-0 transform group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
                
                {/* Enhanced ambient glow effect */}
                <div className="absolute -inset-2 bg-blue-400/5 blur-3xl rounded-[2rem] filter"></div>
                
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-12 bg-white rounded-xl p-4 shadow-xl w-64 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Save up to 40%</p>
                      <p className="text-xs text-gray-500">on average car repairs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-b from-white to-blue-50/50 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
              <div className="text-center">
                <div className="font-bold text-2xl sm:text-4xl text-blue-700">15k+</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Mechanics</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl sm:text-4xl text-blue-700">48K+</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Car Owners</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl sm:text-4xl text-blue-700">$2.4M</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Saved on Repairs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl sm:text-4xl text-blue-700">98%</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-12 sm:mb-16">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Features</h2>
              <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to get your car fixed
              </p>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-gray-600">
                Our platform makes it easy to find and compare mechanics, get quotes, and book services.
              </p>
            </div>
            
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
              <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
                <dt className="flex flex-col gap-y-4">
                  <div className="flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg className="h-6 sm:h-8 w-6 sm:w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.2929 2.70711C11.6834 2.31658 12.3166 2.31658 12.7071 2.70711L15.2929 5.29289C15.6834 5.68342 15.6834 6.31658 15.2929 6.70711L12.7071 9.29289C12.3166 9.68342 11.6834 9.68342 11.2929 9.29289L8.70711 6.70711C8.31658 6.31658 8.31658 5.68342 8.70711 5.29289L11.2929 2.70711Z" />
                      <path d="M11.2929 14.7071C11.6834 14.3166 12.3166 14.3166 12.7071 14.7071L15.2929 17.2929C15.6834 17.6834 15.6834 18.3166 15.2929 18.7071L12.7071 21.2929C12.3166 21.6834 11.6834 21.6834 11.2929 21.2929L8.70711 18.7071C8.31658 18.3166 8.31658 17.6834 8.70711 17.2929L11.2929 14.7071Z" />
                      <path d="M2.70711 8.70711C2.31658 8.31658 2.31658 7.68342 2.70711 7.29289L5.29289 4.70711C5.68342 4.31658 6.31658 4.31658 6.70711 4.70711L9.29289 7.29289C9.68342 7.68342 9.68342 8.31658 9.29289 8.70711L6.70711 11.2929C6.31658 11.6834 5.68342 11.6834 5.29289 11.2929L2.70711 8.70711Z" />
                      <path d="M14.7071 8.70711C14.3166 8.31658 14.3166 7.68342 14.7071 7.29289L17.2929 4.70711C17.6834 4.31658 18.3166 4.31658 18.7071 4.70711L21.2929 7.29289C21.6834 7.68342 21.6834 8.31658 21.2929 8.70711L18.7071 11.2929C18.3166 11.6834 17.6834 11.6834 17.2929 11.2929L14.7071 8.70711Z" />
                    </svg>
                  </div>
                  <span className="text-lg sm:text-xl font-semibold leading-7 text-gray-900">Submit Your Issue</span>
                </dt>
                <dd className="mt-4 text-sm sm:text-base leading-7 text-gray-600">
                  <p>Describe your car's problem or upload diagnostic reports. Our AI-powered system categorizes your issue for accurate matching with specialists.</p>
                </dd>
              </div>
              <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
                <dt className="flex flex-col gap-y-4">
                  <div className="flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg className="h-6 sm:h-8 w-6 sm:w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg sm:text-xl font-semibold leading-7 text-gray-900">Get Multiple Quotes</span>
                </dt>
                <dd className="mt-4 text-sm sm:text-base leading-7 text-gray-600">
                  <p>Local mechanics will review your case and send you their best offers. Compare prices, reviews, and service options all in one place.</p>
                </dd>
              </div>
              <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
                <dt className="flex flex-col gap-y-4">
                  <div className="flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg className="h-6 sm:h-8 w-6 sm:w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="text-lg sm:text-xl font-semibold leading-7 text-gray-900">Choose Your Mechanic</span>
                </dt>
                <dd className="mt-4 text-sm sm:text-base leading-7 text-gray-600">
                  <p>Select the mechanic that best fits your needs. Book the service and get your car fixed with confidence, backed by our satisfaction guarantee.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="bg-blue-50/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Testimonials</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Don't just take our word for it
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Hear from our satisfied customers who have found reliable mechanics and saved on repairs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">JD</div>
                  <div>
                    <h3 className="font-medium text-gray-900">John Doe</h3>
                    <p className="text-sm text-gray-500">Toyota Owner</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700">
                  "I saved over $600 on my transmission repair by getting quotes through FairCarRepair. The mechanic I chose was professional and did excellent work."
                </p>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">SS</div>
                  <div>
                    <h3 className="font-medium text-gray-900">Sarah Smith</h3>
                    <p className="text-sm text-gray-500">BMW Owner</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700">
                  "As a woman, I often felt taken advantage of at repair shops. With FairCarRepair, I got transparent pricing and found a trustworthy mechanic who didn't talk down to me."
                </p>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">MJ</div>
                  <div>
                    <h3 className="font-medium text-gray-900">Mike Johnson</h3>
                    <p className="text-sm text-gray-500">Ford Owner</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700">
                  "The bidding process was eye-opening. I had no idea how much prices could vary for the same service. FairCarRepair helped me find quality service at a fair price."
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="relative bg-blue-700 py-16 sm:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/4 transform blur-3xl" viewBox="0 0 1108 632" aria-hidden="true">
              <path fill="url(#h)" fillOpacity=".25" d="M235.233 402.55c100.932-33.88 195.583-71.38 295.99-36.11 100.415 35.26 138.74 111.13 224.88 142.16 86.137 31.03 188.386-.29 263.902-59.19 75.516-58.89 125.08-158.2 66.556-220.99-58.526-62.77-205.23-58.06-283.26-112.29-78.03-54.24-86.267-176.86-180.794-208.37-94.526-31.5-275.266 29.6-375.645 100.53-100.378 70.94-110.194 151.7-107.781 233.27 2.413 81.57 16.737 163.84 96.152 160.98Z" />
              <path fill="url(#h)" fillOpacity=".3" d="M904.121 467.52c-64.768-39.11-85.849-126.14-55.714-193.29 30.137-67.14 171.337-135.21 204.111-207.85 32.777-72.64-54.836-154.61-150.148-164.92-95.313-10.31-186.083 63.43-261.53 126.27-75.458 62.84-135.596 114.77-216.185 104-80.59-10.77-181.631-83.26-226.558-132.89-44.926-49.62-33.744-75.38-10.248-106.03 23.496-30.64 59.311-66.18 92.575-87.95C280.7-216.43 335.19-227.73 402.859-209.93c67.67 17.81 108.143 64.71 200.788 89.09 92.647 24.38 237.466 26.27 300.427 90.6 62.96 64.33 153.031 130.28 131.76 261.2-21.272 130.93-66.925 275.74-131.693 236.57Z" />
            </svg>
            <defs>
              <linearGradient id="h" gradientUnits="userSpaceOnUse" x1="1220.59" x2="-85.053" y1="432.766" y2="638.715">
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#80CAFF" />
              </linearGradient>
            </defs>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to save on your next car repair?
              </h2>
              <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-8 text-blue-100">
                Join thousands of car owners who have saved money and found quality mechanics through our platform.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
                <a
                  href="/report"
                  className="w-full sm:w-auto rounded-xl bg-white px-6 py-4 text-base font-semibold text-blue-700 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300"
                >
                  Get Started Today
                </a>
                <a href="/learn-more" className="w-full sm:w-auto text-center text-base font-semibold text-white hover:text-blue-100 transition-colors">
                  How it works <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
} 