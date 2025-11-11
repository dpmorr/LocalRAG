'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'

interface Document {
  id: string
  filename: string
  content_type: string
  status: string
  created_at: string
  chunk_count?: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'settings' | 'pricing'>('knowledge')
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadType, setUploadType] = useState<'file' | 'url' | 'podcast'>('file')
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  // Chat settings
  const [initialQuestions, setInitialQuestions] = useState<Array<{
    question: string
    type: 'text' | 'multiple-choice'
    options?: string[]
  }>>([
    { question: 'What are you looking to achieve in your career?', type: 'text' },
    { question: 'What skills would you like to develop?', type: 'text' },
    {
      question: 'What is your experience level?',
      type: 'multiple-choice',
      options: ['Entry Level (0-2 years)', 'Mid Level (3-5 years)', 'Senior (6-10 years)', 'Expert (10+ years)']
    }
  ])
  const [newQuestion, setNewQuestion] = useState('')
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'multiple-choice'>('text')
  const [newOptions, setNewOptions] = useState<string[]>([''])
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful career mentor with years of recruiting experience.')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.getMe()
        setIsLoggedIn(true)
        loadDocuments()
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await api.listDocuments()
      setDocuments(response.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      await api.uploadDocument(formData)
      alert('Document uploaded successfully!')
      setSelectedFile(null)
      loadDocuments()
    } catch (error: any) {
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!url.trim()) return

    setUploading(true)
    try {
      const contentType = uploadType === 'podcast' ? 'podcast' : 'article'
      await api.ingestUrl(url, contentType)
      alert(`${uploadType === 'podcast' ? 'Podcast' : 'Article'} ingested successfully!`)
      setUrl('')
      loadDocuments()
    } catch (error: any) {
      alert(`Ingestion failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (isLoggedIn === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin dashboard</p>
          <a href="/" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Knowledge Admin
                </h1>
                <p className="text-sm text-gray-500">Manage content pipeline & ingestion</p>
              </div>
            </div>
            <motion.a
              href="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back to Home
            </motion.a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'knowledge'
                ? 'bg-white shadow-lg text-purple-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            📚 Knowledge Pipeline
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-white shadow-lg text-purple-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            ⚙️ Chat Settings
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'pricing'
                ? 'bg-white shadow-lg text-purple-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            💰 Pricing & Limits
          </button>
        </div>

        {activeTab === 'knowledge' && (
          <>
            {/* Upload Section */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Content Ingestion</h2>

          {/* Upload Type Selector */}
          <div className="flex gap-3 mb-6">
            {[
              { type: 'file', label: 'Files', icon: '📄' },
              { type: 'url', label: 'Articles/URLs', icon: '🔗' },
              { type: 'podcast', label: 'Podcasts', icon: '🎙️' }
            ].map((item) => (
              <motion.button
                key={item.type}
                onClick={() => setUploadType(item.type as any)}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                  uploadType === item.type
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* File Upload */}
          <AnimatePresence mode="wait">
            {uploadType === 'file' && (
              <motion.div
                key="file"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.xls,.json,.html,.htm,.pptx,.rtf,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tiff"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {selectedFile ? selectedFile.name : 'Click to select file'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: PDF, Word (DOCX/DOC), Text (TXT/MD), Excel (XLSX/XLS), CSV, JSON, HTML, PowerPoint (PPTX), RTF, Images (PNG/JPG/GIF with OCR)
                    </p>
                  </label>
                </div>

                <motion.button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
                  whileHover={{ scale: !selectedFile || uploading ? 1 : 1.02 }}
                  whileTap={{ scale: !selectedFile || uploading ? 1 : 0.98 }}
                >
                  {uploading ? 'Uploading & Processing...' : 'Upload & Process Document'}
                </motion.button>
              </motion.div>
            )}

            {uploadType === 'url' && (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Article or Web Page URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full bg-white border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 outline-none transition-colors"
                  />
                  <p className="text-sm text-gray-500">
                    We'll extract and process the main content automatically
                  </p>
                </div>

                <motion.button
                  onClick={handleUrlUpload}
                  disabled={!url.trim() || uploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
                  whileHover={{ scale: !url.trim() || uploading ? 1 : 1.02 }}
                  whileTap={{ scale: !url.trim() || uploading ? 1 : 0.98 }}
                >
                  {uploading ? 'Fetching & Processing...' : 'Fetch & Process Article'}
                </motion.button>
              </motion.div>
            )}

            {uploadType === 'podcast' && (
              <motion.div
                key="podcast"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Podcast URL or RSS Feed
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/podcast.mp3 or RSS feed URL"
                    className="w-full bg-white border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 outline-none transition-colors"
                  />
                  <p className="text-sm text-gray-500">
                    We'll transcribe the audio and extract key insights
                  </p>
                </div>

                <motion.button
                  onClick={handleUrlUpload}
                  disabled={!url.trim() || uploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
                  whileHover={{ scale: !url.trim() || uploading ? 1 : 1.02 }}
                  whileTap={{ scale: !url.trim() || uploading ? 1 : 0.98 }}
                >
                  {uploading ? 'Processing Podcast...' : 'Process Podcast'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Processing Pipeline Info */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            {
              title: 'Smart Parsing',
              desc: 'Extracts text from PDFs, DOCX, web pages, and audio transcripts',
              icon: '🔍'
            },
            {
              title: 'Intelligent Chunking',
              desc: 'Splits content into optimal chunks preserving context and meaning',
              icon: '✂️'
            },
            {
              title: 'Vector Embedding',
              desc: 'Generates embeddings for semantic search and RAG retrieval',
              icon: '🧠'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              whileHover={{ y: -5 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Documents Table */}
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Processed Documents</h2>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg">No documents yet</p>
              <p className="text-sm">Upload content above to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Filename</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Chunks</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-sm">{doc.filename}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {doc.content_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doc.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : doc.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{doc.chunk_count || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <button className="text-purple-600 hover:text-purple-800 font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
          </>
        )}

        {activeTab === 'settings' && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* System Prompt */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">System Prompt</h2>
              <p className="text-gray-600 mb-4">Configure the AI's personality and behavior</p>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="Enter system prompt..."
              />
              <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                Save System Prompt
              </button>
            </div>

            {/* Initial Questions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Initial Chat Questions</h2>
              <p className="text-gray-600 mb-4">Questions the AI will ask when starting a conversation</p>

              <div className="space-y-4 mb-6">
                {initialQuestions.map((question, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex gap-3 items-start mb-3">
                      <div className="flex-1">
                        <input
                          value={question.question}
                          onChange={(e) => {
                            const updated = [...initialQuestions]
                            updated[index].question = e.target.value
                            setInitialQuestions(updated)
                          }}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                          placeholder="Enter question..."
                        />
                      </div>
                      <select
                        value={question.type}
                        onChange={(e) => {
                          const updated = [...initialQuestions]
                          updated[index].type = e.target.value as 'text' | 'multiple-choice'
                          if (e.target.value === 'multiple-choice' && !updated[index].options) {
                            updated[index].options = ['Option 1', 'Option 2']
                          }
                          setInitialQuestions(updated)
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 transition-all"
                      >
                        <option value="text">Text Input</option>
                        <option value="multiple-choice">Multiple Choice</option>
                      </select>
                      <button
                        onClick={() => setInitialQuestions(initialQuestions.filter((_, i) => i !== index))}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {question.type === 'multiple-choice' && (
                      <div className="mt-3 ml-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Answer Options:</p>
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2 items-center">
                            <input
                              value={option}
                              onChange={(e) => {
                                const updated = [...initialQuestions]
                                if (updated[index].options) {
                                  updated[index].options![optionIndex] = e.target.value
                                  setInitialQuestions(updated)
                                }
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-purple-500 text-sm"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                              onClick={() => {
                                const updated = [...initialQuestions]
                                if (updated[index].options) {
                                  updated[index].options = updated[index].options!.filter((_, i) => i !== optionIndex)
                                  setInitialQuestions(updated)
                                }
                              }}
                              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...initialQuestions]
                            if (updated[index].options) {
                              updated[index].options!.push(`Option ${updated[index].options!.length + 1}`)
                              setInitialQuestions(updated)
                            }
                          }}
                          className="mt-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex gap-3 items-center mb-3">
                  <input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Add new question..."
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as 'text' | 'multiple-choice')}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 transition-all"
                  >
                    <option value="text">Text Input</option>
                    <option value="multiple-choice">Multiple Choice</option>
                  </select>
                </div>

                {newQuestionType === 'multiple-choice' && (
                  <div className="mb-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Options:</p>
                    {newOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          value={option}
                          onChange={(e) => {
                            const updated = [...newOptions]
                            updated[index] = e.target.value
                            setNewOptions(updated)
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          onClick={() => setNewOptions(newOptions.filter((_, i) => i !== index))}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setNewOptions([...newOptions, ''])}
                      className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (newQuestion.trim()) {
                      const newQ: any = {
                        question: newQuestion,
                        type: newQuestionType
                      }
                      if (newQuestionType === 'multiple-choice') {
                        newQ.options = newOptions.filter(opt => opt.trim())
                      }
                      setInitialQuestions([...initialQuestions, newQ])
                      setNewQuestion('')
                      setNewQuestionType('text')
                      setNewOptions([''])
                    }
                  }}
                  className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Question
                </button>
              </div>

              <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                Save Questions
              </button>
            </div>

            {/* Chat Flow Configuration */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Chat Flow Settings</h2>
              <p className="text-gray-600 mb-6">Configure how the chat experience works</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-800">Require Profile Setup</h3>
                    <p className="text-sm text-gray-600">Ask users to complete their profile before chatting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-800">Enable Document Upload</h3>
                    <p className="text-sm text-gray-600">Allow users to upload their CV during chat</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-800">RAG Knowledge Base</h3>
                    <p className="text-sm text-gray-600">Use uploaded documents to answer questions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                Save Chat Flow Settings
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'pricing' && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Rate Limiting */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Rate Limiting</h2>
              <p className="text-gray-600 mb-6">Control how many requests users can make</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requests per Hour (Free Tier)
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requests per Day (Free Tier)
                  </label>
                  <input
                    type="number"
                    defaultValue={50}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requests per Hour (Premium)
                  </label>
                  <input
                    type="number"
                    defaultValue={100}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requests per Day (Premium)
                  </label>
                  <input
                    type="number"
                    defaultValue={500}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    placeholder="500"
                  />
                </div>
              </div>

              <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                Save Rate Limits
              </button>
            </div>

            {/* Pricing Tiers */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Pricing Tiers</h2>
              <p className="text-gray-600 mb-6">Configure subscription pricing and features</p>

              <div className="space-y-6">
                {/* Free Tier */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Free Tier</h3>
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                      $0/month
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Basic career guidance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Limited chat history (7 days)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">CV upload & basic analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-gray-700">Learning plan generation</span>
                    </div>
                  </div>
                </div>

                {/* Premium Tier */}
                <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-purple-800">Premium Tier</h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        defaultValue={29}
                        className="w-24 px-3 py-2 rounded-lg border border-purple-300 focus:border-purple-500"
                        placeholder="29"
                      />
                      <span className="text-purple-700 font-medium">/month</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Everything in Free tier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Unlimited chat history</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Advanced CV optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Personalized learning plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Priority support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Career roadmap & milestones</span>
                    </div>
                  </div>
                </div>

                {/* Enterprise Tier */}
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-800">Enterprise Tier</h3>
                    <span className="px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-sm font-medium">
                      Custom Pricing
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Everything in Premium tier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Custom AI model training</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">Dedicated account manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">SSO & Advanced security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-700">API access</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                Save Pricing Tiers
              </button>
            </div>

            {/* Usage Limits */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Feature Limits</h2>
              <p className="text-gray-600 mb-6">Set limits for specific features</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max CV Uploads (Free)
                  </label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max CV Uploads (Premium)
                  </label>
                  <input
                    type="number"
                    defaultValue={20}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Learning Plans (Free)
                  </label>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Learning Plans (Premium)
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chat History Days (Free)
                  </label>
                  <input
                    type="number"
                    defaultValue={7}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Messages per Thread (Free)
                  </label>
                  <input
                    type="number"
                    defaultValue={50}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
              </div>

              <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                Save Feature Limits
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
