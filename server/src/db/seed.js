const pool = require('../config/db')

const seedCategories = async () => {
  try {
    const defaultCategories = [
      { name: 'Food', color: '#FF6B6B' },
      { name: 'Grocery', color: '#51CF66' },
      { name: 'Travel', color: '#339AF0' },
      { name: 'Rent', color: '#845EF7' },
      { name: 'Shopping', color: '#FF922B' },
      { name: 'Entertainment', color: '#F06595' },
      { name: 'Health', color: '#20C997' },
      { name: 'Other', color: '#868E96' },
    ]

    for (const cat of defaultCategories) {
      await pool.query(
        `INSERT INTO categories (name, color, user_id) 
         VALUES ($1, $2, NULL) 
         ON CONFLICT DO NOTHING`,
        [cat.name, cat.color]
      )
    }

    console.log('✅ Default categories seeded')
    process.exit(0)

  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    process.exit(-1)
  }
}

seedCategories()