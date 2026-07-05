const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const pool = require('./src/config/db')

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

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