'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'

export default function Home() {
  const [showChat, setShowChat] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [particles, setParticles] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate particles on client side only to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    )
  }, [])

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.getMe()
        setIsLoggedIn(true)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    // Check if logged in
    if (!isLoggedIn) {
      setShowAuth(true)
      return
    }

    const userMessage = message
    setMessage('')
    setLoading(true)

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      let response
      if (!threadId) {
        // Create new thread
        response = await api.createThread(userMessage, 'quick')
        setThreadId(response.id)

        // Get full thread with messages
        const thread = await api.getThread(response.id)
        setMessages(thread.messages)
      } else {
        // Add message to existing thread
        response = await api.addMessage(threadId, userMessage)

        // Get updated thread
        const thread = await api.getThread(threadId)
        setMessages(thread.messages)
      }
    } catch (error: any) {
      console.error('Failed to send message:', error)
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      await api.login(email, password)
      setIsLoggedIn(true)
      setShowAuth(false)
    } catch (error: any) {
      alert('Login failed: ' + error.message)
    }
  }

  const handleRegister = async (email: string, password: string, fullName: string) => {
    try {
      await api.register(email, password, fullName)
      await api.login(email, password)
      setIsLoggedIn(true)
      setShowAuth(false)
    } catch (error: any) {
      alert('Registration failed: ' + error.message)
    }
  }

  if (showAuth) {
    return <AuthModal onLogin={handleLogin} onRegister={handleRegister} onClose={() => setShowAuth(false)} />
  }

  if (showChat) {
    return <ChatInterface
      messages={messages}
      message={message}
      setMessage={setMessage}
      sendMessage={sendMessage}
      loading={loading}
      isLoggedIn={isLoggedIn}
      onBack={() => setShowChat(false)}
      messagesEndRef={messagesEndRef}
    />
  }

  return <LandingPage onGetStarted={() => setShowChat(true)} onLogin={() => setShowAuth(true)} isLoggedIn={isLoggedIn} />
}

// Landing Page Component
function LandingPage({ onGetStarted, onLogin, isLoggedIn }: any) {
  const [selectedPivot, setSelectedPivot] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden transition-colors duration-700">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 opacity-70 transition-opacity duration-700">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <radialGradient id="meshGradient1" cx="20%" cy="20%" r="80%" fx="20%" fy="20%">
              <stop offset="0%" stopColor="#7148D4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7148D4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="meshGradient2" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="meshGradient3" cx="80%" cy="80%" r="60%" fx="80%" fy="80%">
              <stop offset="0%" stopColor="#FF4d4d" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF4d4d" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="meshGradient4" cx="10%" cy="90%" r="70%" fx="10%" fy="90%">
              <stop offset="0%" stopColor="#FFB800" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#meshGradient1)" />
          <rect width="100%" height="100%" fill="url(#meshGradient2)" />
          <rect width="100%" height="100%" fill="url(#meshGradient3)" />
          <rect width="100%" height="100%" fill="url(#meshGradient4)" />
          <rect width="100%" height="100%" fill="white" opacity="0.85" className="transition-opacity duration-700" />
        </svg>
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 px-8 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
            style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Pivotr
          </motion.div>
          <motion.button
            onClick={onGetStarted}
            className="relative group bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-all duration-300 text-sm px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Get Started</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-8 py-32 min-h-screen relative z-20 pt-32">
        {/* Hero Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent" />
          <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-purple-500/35 to-pink-500/35 blur-3xl opacity-70" />
          <div className="absolute bottom-[-9rem] left-[-6rem] w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-pink-500/30 to-amber-300/25 blur-3xl opacity-60" />
        </div>

        <div className="text-center max-w-5xl mx-auto relative z-20">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-gray-900/5 backdrop-blur-md border border-gray-900/10 rounded-full px-5 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="text-sm font-medium tracking-wide bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI-powered career coaching
            </span>
          </motion.div>

          {/* Main Headline */}
          <div className="overflow-hidden mb-6">
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Stuck? Find your next move.
              <span className="block bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Personalised career roadmaps
              </span>
              in minutes
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-900/90 mb-12 font-light leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Tell Pivotr your role and goal, get the roadmap, the milestones, and an AI coach that keeps you moving.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 relative group bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-all duration-300 text-lg px-10 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-6">
              🚀 Start your career transformation today with personalised AI coaching.
            </p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <a href="#about" className="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors duration-300">
              <span className="text-xs uppercase tracking-widest mb-2">Discover</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </motion.div>
        </div>
      </main>

      {/* Georgie Testimonial Section */}
      <section className="px-6 md:px-8 lg:px-12 -mt-12 md:-mt-20 relative z-30">
        <motion.div
          className="max-w-5xl mx-auto bg-gray-900/5 backdrop-blur-lg border border-gray-900/10 rounded-3xl p-8 md:p-12 shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:gap-10">
            <div className="shrink-0 mb-6 md:mb-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg" />
            </div>
            <div className="space-y-4 text-gray-800/80">
              <p className="text-lg md:text-xl leading-relaxed">
                "I've spent the last decade helping ambitious people make bold moves before they felt ready. Pivotr is everything I wish they'd had—clarity, coaching and momentum in one place."
              </p>
              <p className="text-sm uppercase tracking-widest text-gray-600">
                Georgie Hubbard · Co-founder of Pivotr & Author of The Bold Move
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Product Overview Section */}
      <div className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">See Pivotr turn uncertainty into momentum</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Understand strengths, gaps, blockers',
                desc: 'Get clarity on where you are and what\'s holding you back'
              },
              {
                title: 'Preview phased career roadmaps',
                desc: 'See your personalized path forward with clear milestones'
              },
              {
                title: 'AI mentor accountability',
                desc: 'Stay on track with consistent guidance and support'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="relative z-10 bg-gradient-to-b from-purple-50/30 to-white py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How it works</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  number: '01',
                  title: 'Set your pivot',
                  desc: 'Choose your path: Pivot Out (new career), Pivot Up (promotion), or Pivot Project (side hustle)'
                },
                {
                  number: '02',
                  title: 'Discover your roadmap',
                  desc: 'Get a phased, personalized plan tailored to your goals and current situation'
                },
                {
                  number: '03',
                  title: 'Do the work with AI coach',
                  desc: 'Take action on clear missions with ongoing AI mentorship and accountability'
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl p-8 shadow-md"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pivot Pathways Section */}
      <div className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose your pivot</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                id: 'out',
                title: 'Pivot Out',
                subtitle: 'New career',
                desc: 'Transition to a completely new industry or role',
                phases: [
                  { name: 'Foundation', desc: 'Build core transferable skills and explore new fields' },
                  { name: 'Skill Building', desc: 'Develop technical and industry-specific capabilities' },
                  { name: 'Positioning', desc: 'Create portfolio, network, and establish credibility' },
                  { name: 'Transition', desc: 'Land your first role and successfully onboard' }
                ]
              },
              {
                id: 'up',
                title: 'Pivot Up',
                subtitle: 'Promotion',
                desc: 'Advance in your current field to the next level',
                phases: [
                  { name: 'Assessment', desc: 'Identify gaps between current role and target position' },
                  { name: 'Skill Development', desc: 'Build leadership and strategic capabilities' },
                  { name: 'Visibility', desc: 'Demonstrate impact and build executive presence' },
                  { name: 'Advancement', desc: 'Secure promotion and succeed in new role' }
                ]
              },
              {
                id: 'project',
                title: 'Pivot Project',
                subtitle: 'Side hustle',
                desc: 'Build something meaningful alongside your career',
                phases: [
                  { name: 'Ideation', desc: 'Validate your idea and find product-market fit' },
                  { name: 'MVP Development', desc: 'Build minimum viable product and test with users' },
                  { name: 'Growth', desc: 'Scale audience, revenue, and operational systems' },
                  { name: 'Sustainability', desc: 'Create sustainable income and manage both careers' }
                ]
              }
            ].map((path, idx) => (
              <motion.div
                key={idx}
                className={`rounded-xl p-8 shadow-lg border cursor-pointer transition-all duration-300 ${
                  selectedPivot === path.id
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-500'
                    : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 hover:shadow-xl hover:scale-105'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedPivot(selectedPivot === path.id ? null : path.id)}
              >
                <h3 className={`text-2xl font-bold mb-2 ${selectedPivot === path.id ? 'text-white' : 'text-gray-900'}`}>
                  {path.title}
                </h3>
                <p className={`text-lg font-semibold mb-3 ${selectedPivot === path.id ? 'text-white/90' : 'text-purple-600'}`}>
                  {path.subtitle}
                </p>
                <p className={`leading-relaxed mb-4 ${selectedPivot === path.id ? 'text-white/80' : 'text-gray-600'}`}>
                  {path.desc}
                </p>

                <AnimatePresence>
                  {selectedPivot === path.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <h4 className="text-lg font-bold mb-4 text-white">Roadmap Phases:</h4>
                        <div className="space-y-3">
                          {path.phases.map((phase, phaseIdx) => (
                            <div key={phaseIdx} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                {phaseIdx + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{phase.name}</div>
                                <div className="text-sm text-white/70">{phase.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onGetStarted()
                          }}
                          className="mt-6 w-full bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-all"
                        >
                          Start This Path →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedPivot !== path.id && (
                  <div className="text-sm text-purple-600 font-medium mt-4">
                    Click to see roadmap phases →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative z-10 bg-gradient-to-b from-purple-50/30 to-white py-24">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Founding Member Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Start your pivot today</h2>
            <p className="text-xl text-gray-600">3-day free trial · Cancel anytime</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Pivotr Pro – Foundation',
                price: '$15',
                yearlyPrice: '$180',
                period: 'per month',
                features: ['Foundation phase roadmap', 'AI career assessment', 'Skill gap analysis', 'Weekly AI check-ins', 'Access to Skill Sprints Library'],
                cta: 'Start 3-Day Free Trial'
              },
              {
                name: 'Pivotr Pro',
                price: '$24',
                yearlyPrice: '$288',
                period: 'per month',
                features: ['Complete phased roadmap', 'Everything in Foundation', 'Unlimited AI mentorship', 'Priority support', 'Early access to new features'],
                cta: 'Start 3-Day Free Trial',
                popular: true
              }
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                className={`bg-white rounded-2xl p-8 shadow-xl ${plan.popular ? 'border-2 border-purple-500 relative' : 'border border-gray-200'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/ {plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.yearlyPrice}/yr after trial</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-4 font-semibold rounded-lg transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white shadow-lg'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { q: 'What is Pivotr?', a: 'Pivotr is an AI-powered career coaching platform that creates personalized roadmaps to help you make your next career move with confidence.' },
              { q: 'Who is Pivotr for?', a: 'Pivotr is for anyone looking to make a career change, get promoted, or start a side project. Whether you\'re early career or experienced, we help you create a clear path forward.' },
              { q: 'How do I get started?', a: 'Start with our 3-day free trial. You\'ll complete an assessment, receive your personalized roadmap, and get access to your AI career coach.' },
              { q: 'What\'s included in the free trial?', a: 'The 3-day trial gives you full access to create your roadmap, understand your strengths and gaps, and start working with your AI mentor.' },
              { q: 'How does the AI work?', a: 'Our AI analyzes your background, goals, and skills to create a phased roadmap tailored to you. It acts as your accountability partner, helping you stay on track with regular check-ins.' },
              { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription at any time with no penalties or long-term commitments.' }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 bg-gradient-to-b from-purple-50/30 to-white py-24">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-16 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to make your bold move?</h2>
            <p className="text-xl text-white/90 mb-8">Start your 3-day free trial today. No credit card required.</p>
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-white hover:bg-gray-100 text-purple-600 font-bold rounded-lg transition-all text-lg shadow-xl"
            >
              Start Free Trial
            </button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold text-xl mb-4">Pivotr</h4>
              <p className="text-gray-400 text-sm">Make your bold move with AI-powered career coaching</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition">Features</li>
                <li className="hover:text-white cursor-pointer transition">Pricing</li>
                <li className="hover:text-white cursor-pointer transition">FAQ</li>
                <li className="hover:text-white cursor-pointer transition">Roadmap</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition">About</li>
                <li className="hover:text-white cursor-pointer transition">Blog</li>
                <li className="hover:text-white cursor-pointer transition">Community</li>
                <li className="hover:text-white cursor-pointer transition">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition">Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 Pivotr. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Chat Interface Component
function ChatInterface({ messages, message, setMessage, sendMessage, loading, isLoggedIn, onBack, messagesEndRef }: any) {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Pivotr
                </h2>
                <p className="text-sm text-gray-500">AI Career Coach</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6 mb-32">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-6xl mb-4">👋</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Hi! Let's find your next move</h3>
                <p className="text-gray-600 mb-6">Ask me about your career, skills, or where you want to go</p>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                  {[
                    'How do I become a software engineer?',
                    'Review my resume',
                    'What skills should I learn?',
                    'Help me prepare for interviews'
                  ].map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => {
                        setMessage(suggestion)
                        setTimeout(sendMessage, 100)
                      }}
                      className="px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg text-sm text-gray-700 hover:bg-purple-50 transition-all border border-gray-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>

                {!isLoggedIn && (
                  <p className="mt-8 text-sm text-gray-400">
                    Please login to start chatting
                  </p>
                )}
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-5 rounded-2xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.message_metadata?.citations && msg.message_metadata.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.message_metadata.citations.map((citation: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-black/10 px-3 py-1 rounded-full"
                            title={citation.text}
                          >
                            📄 {citation.source}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white p-5 rounded-3xl shadow-lg">
                <div className="flex gap-2">
                  <motion.div
                    className="w-2 h-2 bg-purple-600 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-blue-600 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-pink-600 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Box - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 shadow-2xl">
        <div className="container mx-auto px-6 py-6 max-w-4xl">
          <div className="flex gap-3">
            <motion.input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything about your career..."
              className="flex-1 bg-gray-100 text-gray-800 placeholder-gray-400 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              disabled={loading}
              whileFocus={{ scale: 1.01 }}
            />
            <motion.button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-50 text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
              whileHover={{ scale: loading || !message.trim() ? 1 : 1.02 }}
              whileTap={{ scale: loading || !message.trim() ? 1 : 0.98 }}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Auth Modal Component
function AuthModal({ onLogin, onRegister, onClose }: any) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      await onLogin(email, password)
    } else {
      await onRegister(email, password, fullName)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {isLogin ? 'Welcome Back' : 'Get Started'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.input
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-400 hover:text-gray-600 text-sm"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
