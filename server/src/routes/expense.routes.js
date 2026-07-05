const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const {
  parseExpenseInput,
  createExpense,
  getExpenses,
  deleteExpense,
  updateExpense
} = require('../controllers/expense.controller')

router.use(authMiddleware)

router.post('/parse', parseExpenseInput)
router.post('/', createExpense)
router.get('/', getExpenses)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

module.exports = router