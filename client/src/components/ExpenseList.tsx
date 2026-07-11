import { useState } from 'react'
import type { Expense } from '../types'
import CategoryTag from './CategoryTag'
import { deleteExpense } from '../api/expenses'
import EditExpenseRow from './EditExpenseRow'

interface ExpenseListProps {
  expenses: Expense[]
  onDeleted: () => void
}

const groupByDate = (expenses: Expense[]) => {
  const groups: { [key: string]: Expense[] } = {}
  expenses.forEach(expense => {
    const date = expense.date
    if (!groups[date]) groups[date] = []
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
    day: 'numeric', month: 'short'
  })
}

const formatTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

const ExpenseList = ({ expenses, onDeleted }: ExpenseListProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

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
      <div className="flex flex-col items-center justify-center h-full py-12">
        <p className="text-4xl mb-3">💸</p>
        <p className="text-gray-500 text-sm font-medium">No expenses yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Type something above to get started
        </p>
      </div>
    )
  }

  const grouped = groupByDate(expenses)

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, dayExpenses]) => {
        const dayTotal = dayExpenses.reduce(
          (sum, e) => sum + parseFloat(e.amount.toString()), 0
        )

        return (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm font-semibold text-gray-600">
                {formatDateLabel(date)}
              </h3>
              <span className="text-sm text-gray-400 font-medium">
                ₹{dayTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {dayExpenses.map(expense => (
                <div key={expense.id}>
                  {editingId === expense.id ? (
                    /* Edit mode */
                    <EditExpenseRow
                      expense={expense}
                      onSaved={() => {
                        setEditingId(null)
                        onDeleted()
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    /* View mode */
                    <div
                      className="flex items-center justify-between px-4 py-3 group hover:bg-gray-50 transition-colors"
                      style={{
                        background: `linear-gradient(135deg, ${expense.category_color || '#868E96'}06, transparent)`
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {expense.item}
                        </p>
                        <CategoryTag
                          name={expense.category}
                          color={expense.category_color || '#868E96'}
                          time={formatTime(expense.created_at)}
                        />
                      </div>

                      <div className="flex items-center gap-2 ml-3">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{parseFloat(expense.amount.toString()).toLocaleString('en-IN')}
                        </span>

                        {/* Pencil edit button */}
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setEditingId(expense.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-xs"
                          title="Edit"
                        >
                          ✎
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleDelete(expense.id)
                          }}
                          disabled={deletingId === expense.id}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs disabled:opacity-30"
                          title="Delete"
                        >
                          {deletingId === expense.id ? '…' : '✕'}
                        </button>
                      </div>
                    </div>
                  )}
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