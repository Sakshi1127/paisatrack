const pool = require('../config/db')
const { generateMonthlySummary } = require('../services/ai.service')

const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id
    const { month, year } = req.query

    const targetMonth = month || new Date().getMonth() + 1
    const targetYear = year || new Date().getFullYear()

    const result = await pool.query(
      `SELECT 
        c.name as category,
        c.color as category_color,
        SUM(e.amount) as amount,
        COUNT(e.id) as count
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
         AND EXTRACT(MONTH FROM e.date) = $2
         AND EXTRACT(YEAR FROM e.date) = $3
       GROUP BY c.name, c.color
       ORDER BY amount DESC`,
      [userId, targetMonth, targetYear]
    )

    const totalAmount = result.rows.reduce(
      (sum, row) => sum + parseFloat(row.amount), 0
    )

    const categories = result.rows.map(row => ({
      category: row.category,
      color: row.category_color,
      amount: parseFloat(parseFloat(row.amount).toFixed(2)),
      count: parseInt(row.count),
      percentage: totalAmount > 0
        ? parseFloat(((row.amount / totalAmount) * 100).toFixed(1))
        : 0
    }))

    const summary = await generateMonthlySummary({
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      categories,
      month: targetMonth,
      year: targetYear
    })

    return res.json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        total: parseFloat(totalAmount.toFixed(2)),
        categories,
        summary
      }
    })

  } catch (err) {
    console.error('Monthly summary error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch monthly summary.' })
  }
}


const compareMonths = async (req, res) => {
  try {
    const userId = req.user.id
    const { month, year } = req.query

    const targetMonth = parseInt(month) || new Date().getMonth() + 1
    const targetYear = parseInt(year) || new Date().getFullYear()

    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1
    const prevYear = targetMonth === 1 ? targetYear - 1 : targetYear

    const [currentResult, previousResult] = await Promise.all([
      pool.query(
        `SELECT 
          c.name as category,
          c.color,
          SUM(e.amount) as amount
         FROM expenses e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE e.user_id = $1
           AND EXTRACT(MONTH FROM e.date) = $2
           AND EXTRACT(YEAR FROM e.date) = $3
         GROUP BY c.name, c.color
         ORDER BY amount DESC`,
        [userId, targetMonth, targetYear]
      ),
      pool.query(
        `SELECT 
          c.name as category,
          SUM(e.amount) as amount
         FROM expenses e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE e.user_id = $1
           AND EXTRACT(MONTH FROM e.date) = $2
           AND EXTRACT(YEAR FROM e.date) = $3
         GROUP BY c.name
         ORDER BY amount DESC`,
        [userId, prevMonth, prevYear]
      )
    ])

    const currentTotal = currentResult.rows.reduce(
      (sum, row) => sum + parseFloat(row.amount), 0
    )
    const previousTotal = previousResult.rows.reduce(
      (sum, row) => sum + parseFloat(row.amount), 0
    )


    const previousMap = {}
    previousResult.rows.forEach(row => {
      previousMap[row.category] = parseFloat(row.amount)
    })

    const comparison = currentResult.rows.map(row => {
      const currentAmount = parseFloat(row.amount)
      const previousAmount = previousMap[row.category] || 0
      const difference = currentAmount - previousAmount

      return {
        category: row.category,
        color: row.color,
        current: parseFloat(currentAmount.toFixed(2)),
        previous: parseFloat(previousAmount.toFixed(2)),
        difference: parseFloat(difference.toFixed(2)),
        trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same'
      }
    })

    return res.json({
      success: true,
      data: {
        current: {
          month: targetMonth,
          year: targetYear,
          total: parseFloat(currentTotal.toFixed(2))
        },
        previous: {
          month: prevMonth,
          year: prevYear,
          total: parseFloat(previousTotal.toFixed(2))
        },
        difference: parseFloat((currentTotal - previousTotal).toFixed(2)),
        trend: currentTotal > previousTotal ? 'up' : 'down',
        comparison
      }
    })

  } catch (err) {
    console.error('Compare months error:', err.message)
    return res.status(500).json({ error: 'Failed to compare months.' })
  }
}


const getTodayTotal = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(amount), 0) as total,
        COUNT(id) as count
       FROM expenses
       WHERE user_id = $1
         AND date = CURRENT_DATE`,
      [userId]
    )

    return res.json({
      success: true,
      data: {
        total: parseFloat(parseFloat(result.rows[0].total).toFixed(2)),
        count: parseInt(result.rows[0].count),
        date: new Date().toISOString().split('T')[0]
      }
    })

  } catch (err) {
    console.error('Today total error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch today\'s total.' })
  }
}

module.exports = {
  getMonthlySummary,
  compareMonths,
  getTodayTotal
}