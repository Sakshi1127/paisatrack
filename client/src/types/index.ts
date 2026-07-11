export interface User {
  id: number
  name: string
  email: string
}

export interface Category {
  id: number
  name: string
  color: string
  user_id: number | null
}

export interface Expense {
  id: number
  item: string
  amount: number
  category: string
  category_color: string
  date: string
  created_at: string
  raw_input: string
}

export interface ParsedExpense {
  raw_input: string
  item: string
  amount: number | null
  category: string
  confidence: 'high' | 'low'
  suggested_new_category: string | null
  source: 'mock' | 'claude'
}

export interface MonthlyAnalytics {
  month: number
  year: number
  total: number
  categories: CategoryAnalytics[]
  summary: string
}

export interface CategoryAnalytics {
  category: string
  color: string
  amount: number
  count: number
  percentage: number
}

export interface MonthComparison {
  current: { month: number; year: number; total: number }
  previous: { month: number; year: number; total: number }
  difference: number
  trend: 'up' | 'down'
  comparison: {
    category: string
    color: string
    current: number
    previous: number
    difference: number
    trend: 'up' | 'down' | 'same'
  }[]
}