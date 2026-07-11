const pool= require('../config/db')
const {parseExpense} = require('../services/ai.service')

const parseExpenseInput = async (req, res) =>{
    try{
        const {raw_input} = req.body
        const userId = req.user.id

        if(!raw_input || raw_input.trim() === ''){
            return res.status(400).json({error: 'Please enter an expense'})
        }

        const categoriesResult = await pool.query(
            'SELECT name FROM categories WHERE user_id = $1',
            [userId]
        )
        const categories = categoriesResult.rows.map(row => row.name)

        const parsed = await parseExpense(raw_input.trim(), categories)

          return res.json({
      success: true,
      data: {
        raw_input,
        item: parsed.item,
        amount: parsed.amount,
        category: parsed.category,
        confidence: parsed.confidence,
        suggested_new_category: parsed.suggested_new_category,
        source: parsed.source
      }
    })

    }catch(err){
        console.error('Error parsing expense:', err)
        return res.status(500).json({error: 'Failed to parse expense'})
    }
}

const createExpense = async (req, res) =>{
    try{
        const {raw_input, item , amount , category_name, date,color} = req.body
        const userId = req.user.id

        if(!item || !amount || !category_name){
            return res.status(400).json({error: 'Item, amount and category are required'})
        }

        if(isNaN(amount) || amount <= 0){
            return res.status(400).json({error: 'Amount must be a positive number'})
        }

        const categoryResult = await pool.query(
            'SELECT id FROM categories WHERE name = $1 AND user_id = $2',
            [category_name, userId]
        )

        let categoryId = null

       if (categoryResult.rows.length > 0) {
  categoryId = categoryResult.rows[0].id

  // Update color if user picked one
  if (color) {
    await pool.query(
      `UPDATE categories SET color = $1 WHERE id = $2`,
      [color, categoryId]
    )
  }
}else{
            const newCategory = await pool.query(
        `INSERT INTO categories (name, color, user_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [category_name, '#868E96', userId]
      )
      categoryId = newCategory.rows[0].id
        }

     const result = await pool.query(
      `INSERT INTO expenses (raw_input, item, amount, category_id, user_id, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        raw_input || item,
        item,
        parseFloat(amount),
        categoryId,
        userId,
        date || new Date().toISOString().split('T')[0]
      ]
    )

    const expense = result.rows[0]

    // Return expense with category name — frontend needs it for display
    return res.status(201).json({
      success: true,
      message: `₹${amount} added to ${category_name}`,
      data: {
        id: expense.id,
        item: expense.item,
        amount: expense.amount,
        category: category_name,
        date: expense.date,
        created_at: expense.created_at
      }
    })

  } catch (err) {
    console.error('Create expense error:', err.message)
    return res.status(500).json({ error: 'Failed to save expense. Please try again.' })
  }
}


const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id
    const { month, year } = req.query

    // Default to current month and year
    const targetMonth = month || new Date().getMonth() + 1
    const targetYear = year || new Date().getFullYear()

    const result = await pool.query(
      `SELECT 
        e.id,
        e.item,
        e.amount,
        e.raw_input,
        e.date,
        e.created_at,
        c.name as category,
        c.color as category_color
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
         AND EXTRACT(MONTH FROM e.date) = $2
         AND EXTRACT(YEAR FROM e.date) = $3
       ORDER BY e.created_at DESC`,
      [userId, targetMonth, targetYear]
    )

    // Calculate total for the month
    const total = result.rows.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)

    return res.json({
      success: true,
      data: {
        expenses: result.rows,
        total: parseFloat(total.toFixed(2)),
        count: result.rows.length,
        month: targetMonth,
        year: targetYear
      }
    })

  } catch (err) {
    console.error('Get expenses error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch expenses.' })
  }
}


const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const result = await pool.query(
      `DELETE FROM expenses 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' })
    }

    return res.json({
      success: true,
      message: 'Expense deleted successfully'
    })

  } catch (err) {
    console.error('Delete expense error:', err.message)
    return res.status(500).json({ error: 'Failed to delete expense.' })
  }
}


const updateExpense = async (req, res) => {
  try {
    const { id } = req.params
    const { item, amount, category_name, date } = req.body
    const userId = req.user.id

    if (!item || !amount || !category_name) {
      return res.status(400).json({ error: 'Item, amount and category are required' })
    }

    // Find category
    const categoryResult = await pool.query(
      `SELECT id FROM categories 
       WHERE name = $1 AND (user_id = $2 OR user_id IS NULL)
       LIMIT 1`,
      [category_name, userId]
    )

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const categoryId = categoryResult.rows[0].id

    const result = await pool.query(
      `UPDATE expenses 
       SET item = $1, amount = $2, category_id = $3, date = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [item, parseFloat(amount), categoryId, date, id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' })
    }

    return res.json({
      success: true,
      message: 'Expense updated successfully',
      data: result.rows[0]
    })

  } catch (err) {
    console.error('Update expense error:', err.message)
    return res.status(500).json({ error: 'Failed to update expense.' })
  }
}

module.exports = {
  parseExpenseInput,
  createExpense,
  getExpenses,
  deleteExpense,
  updateExpense
}