const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log('✅ Connected to PostgreSQL')
    client.release()
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message)
    process.exit(-1)
  }
}

testConnection()

module.exports = pool