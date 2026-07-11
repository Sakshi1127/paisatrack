import { useState, useEffect } from 'react'
import { getMonthlySummary } from '../api/analytics'
import { getExpenses } from '../api/expenses'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const ThisMonth = () => {
  const [summary, setSummary] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const monthName = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const fetchData = async () => {
    try {
      const [summaryData, expensesData] = await Promise.all([
        getMonthlySummary(),
        getExpenses(),
      ])
      setSummary(summaryData)
      setExpenses(expensesData.expenses)
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Pie chart data
  const chartData = summary?.categories?.map((cat: any) => ({
    name: cat.category,
    value: cat.amount,
    color: cat.color,
    percentage: cat.percentage,
  })) || []

  // Daily spending
  const dailyMap: Record<string, { amount: number, label: string }> = {}
  expenses.forEach(e => {
    const date = new Date(e.date)
    const dayNum = date.getDate().toString()
    const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    if (!dailyMap[dayNum]) dailyMap[dayNum] = { amount: 0, label }
    dailyMap[dayNum].amount += Number(e.amount)
  })
  const dailyData = Object.entries(dailyMap)
    .map(([, { amount, label }]) => ({ day: label, amount }))
    .sort((a, b) => parseInt(a.day) - parseInt(b.day))

  // Top 3
  const top3 = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 3)

  // Stats
  const mostFrequent = summary?.categories?.length > 0
    ? summary.categories.reduce((max: any, cat: any) => cat.count > max.count ? cat : max, summary.categories[0])
    : null
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = lastDay - now.getDate()
  const dailyAvg = dailyData.length > 0
    ? Math.round((summary?.total || 0) / dailyData.length)
    : 0
  const avgPerExpense = expenses.length > 0
    ? Math.round((summary?.total || 0) / expenses.length)
    : 0
  const maxDay = dailyData.length > 0
    ? dailyData.reduce((max, d) => d.amount > max.amount ? d : max, dailyData[0])
    : null

  // Unused categories
  const allCats = ['Food', 'Grocery', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Health']
  const usedCats = summary?.categories?.map((c: any) => c.category) || []
  const unusedCats = allCats.filter(c => !usedCats.includes(c))

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* ── Header ── */}
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-0.5">
              {monthName}
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              ₹{summary?.total?.toLocaleString('en-IN') || 0}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {expenses.length} expenses this month
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-hidden p-5 flex flex-col gap-4">

        {/* TOP ROW — 4 stat cards */}
        <div className="grid grid-cols-4 gap-4 flex-shrink-0">

          {/* Biggest purchase */}
          <div className="bg-white rounded-2xl border border-orange-100 p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #fff7ed, #ffffff)' }}>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🏆</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-orange-500 font-semibold mb-0.5">Biggest Purchase</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {top3[0]?.item || '—'}
              </p>
              <p className="text-xs font-semibold text-orange-500">
                {top3[0] ? `₹${Number(top3[0].amount).toLocaleString('en-IN')}` : 'No data'}
              </p>
            </div>
          </div>

          {/* Most frequent */}
          <div className="bg-white rounded-2xl border border-purple-100 p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #faf5ff, #ffffff)' }}>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🔁</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-purple-500 font-semibold mb-0.5">Most Frequent</p>
              <div className="flex items-center gap-1.5">
                {mostFrequent && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: mostFrequent.color }} />
                )}
                <p className="text-sm font-bold text-gray-900 truncate">
                  {mostFrequent?.category || '—'}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                {mostFrequent ? `${mostFrequent.count} times` : 'No data'}
              </p>
            </div>
          </div>

          {/* Daily average */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #ffffff)' }}>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-xs text-blue-500 font-semibold mb-0.5">Daily Average</p>
              <p className="text-sm font-bold text-gray-900">
                ₹{dailyAvg.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-400">per spending day</p>
            </div>
          </div>

          {/* Days left */}
          <div className="bg-white rounded-2xl border border-green-100 p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #f0fdf4, #ffffff)' }}>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <p className="text-xs text-green-500 font-semibold mb-0.5">Days Left</p>
              <p className="text-sm font-bold text-gray-900">{daysLeft} days</p>
              <p className="text-xs text-gray-400">₹{avgPerExpense.toLocaleString('en-IN')} avg/expense</p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW — 3 columns */}
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">

          {/* Left — Donut chart only */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <div className="w-2 h-5 bg-gradient-to-b from-green-400 to-teal-500 rounded-full" />
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Breakdown
              </h2>
            </div>

            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No data this month</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Donut */}
                <div className="relative flex-shrink-0 flex justify-center">
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
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
                    <p className="text-xs text-gray-400 font-medium">TOTAL</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{summary?.total?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Legend — scrollable */}
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
                          className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Middle — Daily pattern + AI Summary */}
          <div className="flex flex-col gap-4 min-h-0">

            {/* Bar chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1 min-h-0">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full" />
                  <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Daily Pattern
                  </h2>
                </div>
                {maxDay && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-medium">
                    Peak: {maxDay.day}
                  </span>
                )}
              </div>

              {dailyData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={dailyData}
                    margin={{ top: 5, right: 5, bottom: 25, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 9, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v =>
                        `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`
                      }
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        `₹${Number(value).toLocaleString('en-IN')}`, 'Spent'
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="amount" fill="#51CF66" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* AI Summary */}
            {summary?.summary && (
              <div
                className="rounded-2xl p-4 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                  border: '1px solid #bbf7d0'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✨</span>
                    </div>
                    <span className="text-xs font-bold text-green-800">AI Summary</span>
                  </div>
                  <button
                    onClick={fetchData}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="text-xs text-green-900 leading-relaxed">{summary.summary}</p>
              </div>
            )}
          </div>

          {/* Right — Top 3 + Insights */}
          <div className="flex flex-col gap-4 min-h-0">

            {/* Top 3 purchases */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-5 bg-gradient-to-b from-orange-400 to-rose-500 rounded-full" />
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Top 3 Purchases
                </h2>
              </div>
              {top3.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No expenses yet</p>
              ) : (
                <div className="space-y-2">
                  {top3.map((expense, i) => (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${expense.category_color || '#868E96'}12, transparent)`,
                        border: `1px solid ${expense.category_color || '#868E96'}25`
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: expense.category_color || '#868E96' }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {expense.item}
                        </p>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${expense.category_color || '#868E96'}20`,
                            color: expense.category_color || '#868E96'
                          }}
                        >
                          {expense.category}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                        ₹{Number(expense.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-5 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full" />
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Insights
                </h2>
              </div>
              <div className="space-y-3">

                {mostFrequent && (
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                    <p className="text-xs text-purple-600 font-semibold mb-1">
                      Most frequent category
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: mostFrequent.color }} />
                        <span className="text-sm font-bold text-gray-800">
                          {mostFrequent.category}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-purple-100">
                        {mostFrequent.count} times
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                  <p className="text-xs text-orange-600 font-semibold mb-1">
                    Days left this month
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">
                      {daysLeft} days remaining
                    </span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-orange-100">
                      ₹{dailyAvg.toLocaleString('en-IN')}/day avg
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold mb-1">
                    Average per expense
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    ₹{avgPerExpense.toLocaleString('en-IN')} per item
                  </p>
                </div>

                {unusedCats.length > 0 && (
                  <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-xs text-green-600 font-semibold mb-1">
                      Zero spend this month
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {unusedCats.join(' · ')}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    Categories used
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {summary?.categories?.length || 0} of 8
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThisMonth