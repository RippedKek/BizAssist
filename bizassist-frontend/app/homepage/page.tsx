'use client';

import React, { useState } from 'react';
import { Sparkles, Sun, Moon, Lightbulb, Wand2, Palette, Network, CheckCircle, BarChart3, PenTool, User } from 'lucide-react';
import InputIdeaModal from '../../components/InputIdeaModal';

const Homepage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDark = theme === 'dark';

  const handleGetStarted = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* TopNavBar */}
      <header className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg ${
                isDark ? 'bg-blue-600' : 'bg-emerald-600'
              } flex items-center justify-center`}
            >
              <Sparkles className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold'>BizAssist</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href='#'
              className={`${
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Pitches
            </a>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              Log Out
            </button>
            <button
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-100 border border-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HeroSection */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-12 text-center lg:grid-cols-2 lg:gap-16 lg:text-left">
              <div className="flex flex-col items-center justify-center gap-6 lg:items-start">
                <div className="flex flex-col gap-4">
                  <h1 className={`text-4xl font-black leading-tight tracking-tighter ${isDark ? 'text-white' : 'text-blue-600'} md:text-5xl lg:text-6xl`}>
                    From Idea to Investor-Ready Pitch in Minutes.
                  </h1>
                  <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'} md:text-lg`}>
                    BizAssist uses AI to structure, validate, and design your business ideas, making you ready to impress.
                  </p>
                </div>
                <button
                  onClick={handleGetStarted}
                  className="flex h-12 w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-6 text-base font-bold text-white transition-opacity hover:opacity-90 lg:w-auto"
                >
                  <span className="truncate">Get Started for Free</span>
                </button>
              </div>
              <div className="flex items-center justify-center">
                <div className={`aspect-video w-full max-w-lg rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <img alt="A person presenting a business plan on a digital tablet." className="h-full w-full rounded-xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXFUrunSJjWx68h7QyjI7q4MBCWH-_vn82UVkKVIUksvesP51DNIG7u2STzKsTymqXBqm0vCJNnwxl6emkmazaSIjYcbKf60ohRp6XVciIlFUeKIaGyIi4WkOmqM5bVTIUEUkzzgIHE_Tn4agaFSc-mg0QxhCkqMG9SaB6zq2RlUtA_QFn12ML2c55RcCuUdCd18mT8kbyaE41cAZ51lGq3y84sw9SZI7Y455GEp4FaA7WtwcMZMcRP-34pLr3JpNM5Yh3E4Ejssgk"/>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* "How It Works" Section */}
        <section className={`py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto flex flex-col items-center gap-12 px-4">
            <div className="flex max-w-2xl flex-col gap-3 text-center">
              <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-blue-600'} md:text-4xl`}>A Simple Path to a Powerful Pitch</h2>
              <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} md:text-lg`}>Follow these simple steps to transform your vision into a compelling business plan.</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
              <div className={`flex flex-col gap-4 rounded-xl border p-6 text-center ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-100'} text-emerald-400`}>
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold">1. Share Your Idea</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Simply input your raw business concept, target market, and unique value proposition.</p>
                </div>
              </div>
              <div className={`flex flex-col gap-4 rounded-xl border p-6 text-center ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-100'} text-emerald-400`}>
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold">2. Let AI Work Its Magic</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Our AI analyzes your idea, structures it professionally, and generates key sections.</p>
                </div>
              </div>
              <div className={`flex flex-col gap-4 rounded-xl border p-6 text-center ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-100'} text-emerald-400`}>
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold">3. Customize Your Pitch</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Refine content, choose a professional template, and export your investor-ready pitch.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto flex flex-col items-center gap-12 px-4">
            <div className="flex max-w-2xl flex-col gap-3 text-center">
              <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-blue-600'} md:text-4xl`}>Core Features to Supercharge Your Pitch</h2>
              <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} md:text-lg`}>Everything you need to build a business case that commands attention and inspires confidence.</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`flex flex-col gap-3 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <span className="material-symbols-outlined text-emerald-400 text-3xl">hub</span>
                <h3 className="text-lg font-bold">AI-Powered Structuring</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Instantly organize your thoughts into a coherent and persuasive business narrative.</p>
              </div>
              <div className={`flex flex-col gap-3 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <span className="material-symbols-outlined text-emerald-400 text-3xl">verified</span>
                <h3 className="text-lg font-bold">Market Validation</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Get AI-driven insights on your target market and competitive landscape.</p>
              </div>
              <div className={`flex flex-col gap-3 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <span className="material-symbols-outlined text-emerald-400 text-3xl">monitoring</span>
                <h3 className="text-lg font-bold">Financial Projections</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Generate realistic financial forecasts to prove your idea's viability.</p>
              </div>
              <div className={`flex flex-col gap-3 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <span className="material-symbols-outlined text-emerald-400 text-3xl">design_services</span>
                <h3 className="text-lg font-bold">Visual Design</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose from stunning templates to create a pitch deck that looks professional.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={`py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto flex flex-col items-center gap-12 px-4">
            <div className="flex max-w-2xl flex-col gap-3 text-center">
              <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-blue-600'} md:text-4xl`}>Trusted by Entrepreneurs in Bangladesh</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className={`flex flex-col gap-4 rounded-xl border p-6 ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"BizAssist saved me weeks of work. I went from a scattered idea to a professional pitch deck that secured my first round of funding. Absolutely essential for any new founder."</p>
                <div className="flex items-center gap-4 pt-2">
                  <img className="h-12 w-12 rounded-full object-cover" alt="Profile photo of Rahman Khan" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqX3GEondybsOTXdt1JWyDkgoXdy2OLYfwe2RgHRGRpOrGIjLuJZPyuMKnGUb__0KTj_pPSY-Xh7yIl2EDcZn86Cr_HHVgikiK8YxFhQNa9om4H6W7hcRVIVk_fR4iKuhj6-YJ7Cm72nWfkviZ4X-FUT9Y3i32wSBmmhwfFPh9fMtcBUMq2zJEfJtWiLzvrW9nlakTsXwqCVBqw_4XWRxw-i1PmTQBje5oJdta1GLMjbzneZoytu8Mwp3v2OGSRsgYWlQtyDx9EkME"/>
                  <div>
                    <p className="font-bold">Rahman Khan</p>
                    <p className="text-sm text-gray-600">Founder, Chaya Tech</p>
                  </div>
                </div>
              </div>
              <div className={`flex flex-col gap-4 rounded-xl border p-6 ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"As a non-business person, creating a pitch was daunting. BizAssist guided me through every step. The AI suggestions were insightful and helped me articulate my vision clearly."</p>
                <div className="flex items-center gap-4 pt-2">
                  <img className="h-12 w-12 rounded-full object-cover" alt="Profile photo of Fatima Ahmed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSSdX_6wXUJ56U_Rt5wd4SC6qadHqDAgILZqzFjSny9MQQG8v_LSRcHxYHBvXYIgYQNJ4lGrOsrWv9VHQSMMismMhydN3hRRue6lx3sKWocj3GvwLKjvqe_lBA7whUtIdZF0KAPBVby0gUxZ6SPqtls8Zv50GCi-B0F-_WGv4z_nHZcMvN0nPJS0ucAW7YUYMlei-AZrYfxNqwS9f8zCegQMWwCxU_4pOJRr3uFtZE4YxcK9ZyP7b7PPLWfveh_upU2itnHvpfOnfb"/>
                  <div>
                    <p className="font-bold">Fatima Ahmed</p>
                    <p className="text-sm text-gray-600">CEO, Shujog</p>
                  </div>
                </div>
              </div>
              <div className={`flex flex-col gap-4 rounded-xl border p-6 ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"The financial projection tool is a game-changer. It helped us create realistic forecasts that impressed investors. The best platform for early-stage startups in Bangladesh."</p>
                <div className="flex items-center gap-4 pt-2">
                  <img className="h-12 w-12 rounded-full object-cover" alt="Profile photo of Anisul Islam" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLwWGKtsDE7X-6M0Nu5zhKJrDPGUqVkQtpRPBrDZgi8iobXR5KMU3NcuQt46eqGQA_OarHT8eAFzXqIuivzNpofBVK3isBn9uBk-2VdEjCAj4NX2xMA-pFqxWMF2XvwzGrPjB2d4eGps9MFi1Dx382BeWWrUcEYXuZrKImOmlL2LmrchO9oLktCr00_lva0Av2MNE7DO-9SPgBEN69OQuyoDwJzlhx112Lszsr432X8mXe7kKEGFvt7hA2iYCJndy95Hdw6KwWOch0"/>
                  <div>
                    <p className="font-bold">Anisul Islam</p>
                    <p className="text-sm text-gray-600">Co-Founder, Pathao Eats</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl rounded-xl bg-blue-600 p-8 text-center text-white md:p-12">
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to bring your business idea to life?</h2>
                <p className="max-w-xl text-base text-gray-200 md:text-lg">Stop waiting and start building. Create a compelling, investor-ready business pitch today and take the first step towards your entrepreneurial dream.</p>
                <button
                  onClick={handleGetStarted}
                  className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-emerald-500 px-6 text-base font-bold text-blue-600 transition-opacity hover:opacity-90"
                >
                  <span className="truncate">Get Started for Free</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-10 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          {/* Brand + Tagline */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-blue-600' : 'bg-emerald-600'
                }`}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">BizAssist</span>
            </div>

            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Empowering the next generation of Bangladeshi entrepreneurs.
            </p>
          </div>

          {/* Divider and Credit */}
          <div
            className={`mt-8 border-t pt-4 text-center text-sm ${
              isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
            }`}
          >
            <p>© {new Date().getFullYear()} BizAssist by Team Ultron</p>
          </div>
        </div>
      </footer>

      {/* Input Idea Modal */}
      <InputIdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};

export default Homepage;
