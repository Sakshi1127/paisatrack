const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const {
  getMonthlySummary,
  compareMonths,
  getTodayTotal
} = require('../controllers/analytics.controller')

router.use(authMiddleware)

router.get('/summary', getMonthlySummary)
router.get('/compare', compareMonths)
router.get('/today', getTodayTotal)

module.exports = router