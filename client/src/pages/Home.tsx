import { useState, useEffect } from 'react'
import { getExpenses, deleteExpense } from '../api/expenses'
import { getTodayTotal, getMonthlySummary } from '../api/analytics'
import type{ Expense, ParsedExpense } from '../types'
import ExpenseInput from '../components/ExpenseInput'
import ConfirmCard from '../components/ConfirmCard'
import StatCard from '../components/StatCard'

const formatDateLabel = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const formatTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

const groupByDate = (expenses: Expense[]) => {
  const groups: Record<string, Expense[]> = {}
  expenses.forEach(e => {
    if (!groups[e.date]) groups[e.date] = []
    groups[e.date].push(e)
  })
  return groups
}

const CollapsibleDay = ({
  date, expenses, onDeleted,
}: {
  date: string
  expenses: Expense[]
  onDeleted: () => void
}) => {
  const [open, setOpen] = useState(date === new Date().toISOString().split('T')[0])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const dayTotal = expenses.reduce((s, e) => s + Number(e.amount), 0)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    await deleteExpense(id)
    onDeleted()
    setDeletingId(null)
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors hover:bg-white/60"
      >
        <div className="flex items-center gap-2">
          <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▶</span>
          <span className="text-sm font-semibold text-gray-700">{formatDateLabel(date)}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {expenses.length}
          </span>
        </div>
        <span className="text-sm font-bold text-gray-700">₹{dayTotal.toLocaleString('en-IN')}</span>
      </button>

      {open && (
        <div className="mx-1 rounded-xl overflow-hidden">
          {expenses.map((expense, i) => (
            <div
              key={expense.id}
              className={`flex items-center justify-between px-4 py-3 group transition-colors hover:bg-white/80 ${
                i !== expenses.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${expense.category_color || '#868E96'}08, transparent)`
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1">{expense.item}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${expense.category_color || '#868E96'}20`,
                      color: expense.category_color || '#868E96',
                      border: `1px solid ${expense.category_color || '#868E96'}40`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: expense.category_color || '#868E96' }} />
                    {expense.category}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(expense.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <span className="text-sm font-bold text-gray-900">₹{Number(expense.amount).toLocaleString('en-IN')}</span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs"
                >
                  {deletingId === expense.id ? '…' : '✕'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Home = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [parsed, setParsed] = useState<ParsedExpense | null>(null)
  const [todayTotal, setTodayTotal] = useState(0)
  const [monthTotal, setMonthTotal] = useState(0)
  const [monthCount, setMonthCount] = useState(0)
  const [topCategory, setTopCategory] = useState('')
  const [topCategoryAmount, setTopCategoryAmount] = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [expensesData, todayData, summaryData] = await Promise.all([
        getExpenses(),
        getTodayTotal(),
        getMonthlySummary(),
      ])
      setExpenses(expensesData.expenses)
      setTodayTotal(todayData.total)
      setMonthTotal(summaryData.total)
      setMonthCount(expensesData.count)
      setCategories(summaryData.categories)
      setSummary(summaryData.summary)
      if (summaryData.categories.length > 0) {
        setTopCategory(summaryData.categories[0].category)
        setTopCategoryAmount(summaryData.categories[0].amount)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'short',
  })

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const grouped = groupByDate(expenses)

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gray-50">

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{getGreeting()}</h1>
          <p className="text-sm text-gray-400">{today}</p>
        </div>
        <div className="w-[440px] relative">
          <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 hover:border-green-300 focus-within:border-green-500 focus-within:bg-white rounded-2xl px-4 py-3 transition-all shadow-sm">
            <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">✨</span>
            </div>
            <ExpenseInput onParsed={(p, r) => setParsed({ ...p, raw_input: r })} />
          </div>
          {parsed && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2">
              <ConfirmCard
                parsed={parsed}
                onSaved={() => { setParsed(null); fetchData() }}
                onCancel={() => setParsed(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 flex flex-col gap-5">

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-5 flex-shrink-0">
          <StatCard
            title="Spent this month"
            value={`₹${monthTotal.toLocaleString('en-IN')}`}
            subtitle={`${monthCount} expenses logged`}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Today"
            value={`₹${todayTotal.toLocaleString('en-IN')}`}
            subtitle={today}
            gradient="bg-gradient-to-br from-violet-500 to-purple-700"
          />
          <StatCard
            title="Top category"
            value={topCategory || '—'}
            subtitle={topCategoryAmount ? `₹${topCategoryAmount.toLocaleString('en-IN')}` : 'No data yet'}
            gradient="bg-gradient-to-br from-orange-400 to-rose-500"
          />
        </div>

        {/* Bottom two columns — fill remaining height */}
        <div className="grid grid-cols-3 gap-5 flex-1 min-h-0">

          {/* Recent Activity — scrolls inside */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-gradient-to-b from-green-400 to-teal-500 rounded-full" />
                <h2 className="text-sm font-bold text-gray-800">Recent Activity</h2>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {expenses.length} this month
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-4xl mb-3">💸</p>
                  <p className="text-gray-500 text-sm font-medium">No expenses yet</p>
                  <p className="text-gray-400 text-xs mt-1">Type something above to get started</p>
                </div>
              ) : (
                Object.entries(grouped).map(([date, dayExpenses]) => (
                  <CollapsibleDay
                    key={date}
                    date={date}
                    expenses={dayExpenses}
                    onDeleted={fetchData}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 min-h-0">

            {/* Where It's Going */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-1">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 flex-shrink-0">
                <div className="w-2 h-6 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full" />
                <h2 className="text-sm font-bold text-gray-800">Where It's Going</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {categories.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
                ) : (
                  <div className="space-y-4">
                    {categories.map(cat => (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              ₹{cat.amount.toLocaleString('en-IN')}
                            </span>
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${cat.color}20`,
                                color: cat.color
                              }}
                            >
                              {cat.percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary */}
            {summary && (
              <div
                className="rounded-2xl p-5 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4, #f0fdfa)',
                  border: '1px solid #bbf7d0'
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">✨</span>
                  </div>
                  <span className="text-sm font-bold text-green-800">AI Summary</span>
                </div>
                <p className="text-xs text-green-900 leading-relaxed">{summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home