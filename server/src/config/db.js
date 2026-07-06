const { Pool, types } = require('pg')
require('dotenv').config()

// Fix date timezone issue
// By default pg converts dates to JS Date objects which shifts timezone
// This tells pg to return dates as plain strings instead
types.setTypeParser(1082, val => val)

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