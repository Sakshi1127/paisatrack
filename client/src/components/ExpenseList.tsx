import type{ Expense } from '../types'
import CategoryTag from './CategoryTag'
import { deleteExpense } from '../api/expenses'
import { useState } from 'react'

interface ExpenseListProps {
  expenses: Expense[]
  onDeleted: () => void
}

// Why group by date?
// Instead of one flat list — show "Today", "Yesterday", "5 Jul"
// Much easier to scan and understand

const groupByDate = (expenses: Expense[]) => {
  const groups: { [key: string]: Expense[] } = {}

  expenses.forEach(expense => {
    const date = expense.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
  })

  return groups
}

const formatDateLabel = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'

  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  })
}

const formatTime = (createdAt: string) => {
  return new Date(createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const ExpenseList = ({ expenses, onDeleted }: ExpenseListProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id)
      await deleteExpense(id)
      onDeleted()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeletingId(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">💸</p>
        <p className="text-gray-500 text-sm">No expenses yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Type something above to get started
        </p>
      </div>
    )
  }

  const grouped = groupByDate(expenses)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, dayExpenses]) => {
        const dayTotal = dayExpenses.reduce(
          (sum, e) => sum + parseFloat(e.amount.toString()), 0
        )

        return (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {formatDateLabel(date)}
              </h3>
              <span className="text-sm text-gray-500">
                ₹{dayTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Expenses for this date */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {dayExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between px-4 py-3 group"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {expense.item}
                    </p>
                    <CategoryTag
                      name={expense.category}
                      color={expense.category_color || '#868E96'}
                      time={formatTime(expense.created_at)}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{parseFloat(expense.amount.toString()).toLocaleString('en-IN')}
                    </span>
                    {/* Delete button — only shows on hover */}
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity disabled:opacity-50"
                    >
                      {deletingId === expense.id ? '...' : '✕'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ExpenseList