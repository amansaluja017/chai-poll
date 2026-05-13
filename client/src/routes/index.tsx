import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, PieChart, Users, Zap, ShieldCheck, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <span className="font-semibold text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="">{answer}</p>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <main className="min-h-screen font-sans selection:bg-[#F2923B]/30">

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F2923B]/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          {/* Left Text */}
          <div className="flex-1 space-y-8 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F2923B]/30 bg-[#F2923B]/10 text-[#F2923B] text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4" />
              The easiest way to make decisions
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Create Polls in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2923B] to-[#f5b372]">Seconds.</span>
            </h1>
            <p className="text-xl max-w-xl mx-auto md:mx-0">
              Engage your audience, gather insights, and make data-driven decisions effortlessly. Beautiful, fast, and secure polling platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link to="/poll" className="px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(242,146,59,0.3)] hover:shadow-[0_0_30px_rgba(242,146,59,0.5)] hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: '#F2923B' }}>
                Create a Poll
              </Link>
              <Link to="/login" className="px-8 py-4 rounded-xl font-bold border border-white/20 text-white hover:bg-white/5 transition-all duration-300">
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Animation / Graphic */}
          <div className="flex-1 w-full max-w-lg relative z-10 hidden sm:block">
            <div className="relative w-full aspect-square">
              {/* Central Circle */}
              <div className="absolute inset-0 m-auto w-48 h-48 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-2xl z-20">
                <BarChart3 className="w-20 h-20 text-[#F2923B] animate-bounce" style={{ animationDuration: '3s' }} />
              </div>

              {/* Orbiting Elements */}
              <div className="absolute top-0 right-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center animate-pulse shadow-lg transform rotate-12" style={{ animationDuration: '4s' }}>
                <PieChart className="w-10 h-10 text-white/80" />
              </div>

              <div className="absolute bottom-10 left-0 w-24 h-24 rounded-2xl bg-[#F2923B]/20 backdrop-blur-md border border-[#F2923B]/30 flex items-center justify-center shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-500 z-30">
                <Users className="w-10 h-10 text-[#F2923B]" />
              </div>

              <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/30 flex items-center justify-center shadow-lg z-10">
                <CheckCircle2 className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg max-w-2xl mx-auto">Three simple steps to start gathering opinions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#F2923B]/50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-[#F2923B]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Create</h3>
              <p className="">Design your poll with multiple question types, custom themes, and specific privacy settings.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#F2923B]/50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Share</h3>
              <p className="">Distribute your poll via a simple link, embed it on your site, or share directly to social media.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#F2923B]/50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Analyze</h3>
              <p className="">Watch results come in real-time with beautiful charts, data exports, and deep insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg">Everything you need to know about Chai Poll.</p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="Is Chai Poll completely free to use?"
              answer="Yes! Our core features including unlimited polls and responses are completely free. We also offer premium features for advanced analytics."
            />
            <FAQItem
              question="Do respondents need an account to vote?"
              answer="By default, no. You can create anonymous polls that anyone can answer. However, you can toggle 'Requires Login' if you want to prevent duplicate votes."
            />
            <FAQItem
              question="Can I export my poll data?"
              answer="Absolutely. You can export all your poll responses in CSV format at any time from your dashboard."
            />
            <FAQItem
              question="What question types are supported?"
              answer="Currently, we support Multiple Choice (single selection) and open-ended Text Input. We're actively working on adding more types soon!"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
