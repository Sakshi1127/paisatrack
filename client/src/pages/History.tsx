import { useState, useEffect } from 'react'
import { getMonthlySummary, compareMonths } from '../api/analytics'
import { getExpenses } from '../api/expenses'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const History = () => {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [summary, setSummary] = useState<any>(null)
  const [comparison, setComparison] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [summaryData, comparisonData, expensesData] = await Promise.all([
        getMonthlySummary(month, year),
        compareMonths(month, year),
        getExpenses(month, year),
      ])
      setSummary(summaryData)
      setComparison(comparisonData)
      setExpenses(expensesData.expenses)
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [month, year])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()

  const chartData = summary?.categories?.map((cat: any) => ({
    name: cat.category,
    value: cat.amount,
    color: cat.color,
    percentage: cat.percentage,
  })) || []

  const prevMonthName = comparison
    ? MONTHS[comparison.previous.month - 1]
    : ''

  const totalDiff = comparison?.difference || 0

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* Header */}
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              History
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              ₹{summary?.total?.toLocaleString('en-IN') || 0}
            </h1>
            {comparison && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-sm font-semibold ${totalDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalDiff > 0 ? '↑' : '↓'} ₹{Math.abs(totalDiff).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-400">vs {prevMonthName}</span>
              </div>
            )}
          </div>

          {/* Month navigator */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 font-bold transition-colors"
            >
              ‹
            </button>
            <div className="text-center min-w-[140px]">
              <p className="text-base font-bold text-gray-900">
                {MONTHS[month - 1]} {year}
              </p>
              <p className="text-xs text-gray-400">
                {expenses.length} expenses
              </p>
            </div>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded-xl text-gray-600 font-bold transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
       <LoadingSpinner message="Loading history..." />
      ) : error ? (
  <ErrorState message="Failed to load history" onRetry={fetchData} />
)       : (
        <div className="flex-1 overflow-hidden p-5">
          <div className="grid grid-cols-3 gap-5 h-full min-h-0">

            {/* Left — Donut chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <div className="w-2 h-5 bg-gradient-to-b from-green-400 to-teal-500 rounded-full" />
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  {MONTHS[month - 1]} Breakdown
                </h2>
              </div>

              {chartData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-500 text-sm font-medium">No expenses</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Nothing recorded for {MONTHS[month - 1]}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="relative flex justify-center flex-shrink-0">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry: any, index: number) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xs text-gray-400">TOTAL</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{summary?.total?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 overflow-y-auto space-y-2 mt-3">
                    {chartData.map((cat: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.color }} />
                            <span className="text-xs text-gray-600 font-medium">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-900">
                              ₹{cat.value.toLocaleString('en-IN')}
                            </span>
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                            >
                              {cat.percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Middle — Month comparison */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-5 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full" />
                  <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    VS {prevMonthName}
                  </h2>
                </div>

                {/* Total comparison */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">{MONTHS[month - 1]}</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{comparison?.current?.total?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${totalDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {totalDiff > 0 ? '↑' : '↓'}
                    </div>
                    <p className={`text-xs font-bold ${totalDiff > 0 ? 'text-red-400' : 'text-green-500'}`}>
                      ₹{Math.abs(totalDiff).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">{prevMonthName}</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{comparison?.previous?.total?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Per category comparison */}
              <div className="flex-1 overflow-y-auto p-4">
                {!comparison?.comparison?.length ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-400 text-sm text-center">
                      No previous month data to compare
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comparison.comparison.map((cat: any) => (
                      <div
                        key={cat.category}
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${cat.color}08`, border: `1px solid ${cat.color}15` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cat.color }} />
                            <span className="text-sm font-semibold text-gray-800">
                              {cat.category}
                            </span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            cat.trend === 'up'
                              ? 'bg-red-50 text-red-500 border border-red-100'
                              : cat.trend === 'down'
                              ? 'bg-green-50 text-green-600 border border-green-100'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {cat.trend === 'up' ? '↑' : cat.trend === 'down' ? '↓' : '→'}
                            {cat.trend !== 'same'
                              ? ` ₹${Math.abs(cat.difference).toLocaleString('en-IN')}`
                              : ' Same'
                            }
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-16 flex-shrink-0">
                              {MONTHS[month - 1].slice(0, 3)}
                            </span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.min((cat.current / (comparison.current.total || 1)) * 100, 100)}%`,
                                  backgroundColor: cat.color
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-900 w-16 text-right flex-shrink-0">
                              ₹{cat.current.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-16 flex-shrink-0">
                              {prevMonthName.slice(0, 3)}
                            </span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.min((cat.previous / (comparison.previous.total || 1)) * 100, 100)}%`,
                                  backgroundColor: `${cat.color}60`
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-400 w-16 text-right flex-shrink-0">
                              ₹{cat.previous.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right — Expense list for that month */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-gradient-to-b from-orange-400 to-rose-500 rounded-full" />
                  <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    All Expenses
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {expenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-gray-400 text-sm">No expenses this month</p>
                  </div>
                ) : (
                  expenses.map((expense, i) => (
                    <div
                      key={expense.id}
                      className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors ${
                        i !== expenses.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${expense.category_color || '#868E96'}06, transparent)`
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                          {expense.item}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${expense.category_color || '#868E96'}20`,
                              color: expense.category_color || '#868E96',
                              border: `1px solid ${expense.category_color || '#868E96'}30`
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: expense.category_color || '#868E96' }} />
                            {expense.category}
                          </span>
                          <span className="text-xs text-gray-400">{expense.date}</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 ml-3 flex-shrink-0">
                        ₹{Number(expense.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History