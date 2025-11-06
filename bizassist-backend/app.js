require('dotenv').config()
const express = require('express')
const corsMiddleware = require('./middleware/cors')
const errorHandler = require('./middleware/errorHandler')
const ideaRoutes = require('./routes/ideaRoutes')
const healthRoutes = require('./routes/healthRoutes')
const pitchPracticeRoutes = require('./routes/pitchPracticeRoutes')
const chatbotRoutes = require('./routes/chatbotRoutes')

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(express.json())
app.use(corsMiddleware)

// Routes
app.use('/api/v1', ideaRoutes)
app.use('/api/v1', healthRoutes)
app.use('/api/v1/pitch-practice', pitchPracticeRoutes)
app.use('/api/v1/chatbot', chatbotRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
