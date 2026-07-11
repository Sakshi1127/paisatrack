const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const pool = require('./src/config/db')
const authRoutes = require('./src/routes/auth.routes')
const expenseRoutes = require('./src/routes/expense.routes')
const categoryRoutes = require('./src/routes/category.routes')
const analyticsRoutes = require('./src/routes/analytics.routes')

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'https://paisatrack-trackeveryrupee.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(helmet())
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/analytics', analyticsRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PaisaTrack server is running 🚀' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

module.exports = app